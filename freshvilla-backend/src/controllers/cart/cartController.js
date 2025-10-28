const { Cart, CartItem } = require('../../models');
const { Op } = require('sequelize');

class CartController {
  // Get or create cart
  async getOrCreateCart(req, res) {
    try {
      const { customerId, guestToken } = req.body;

      let cart;

      if (customerId) {
        cart = await Cart.findOne({
          where: { customerId, status: 'active' },
          include: [{ model: CartItem, as: 'items' }],
        });
      } else if (guestToken) {
        cart = await Cart.findOne({
          where: { guestToken, status: 'active' },
          include: [{ model: CartItem, as: 'items' }],
        });
      }

      if (!cart) {
        cart = await Cart.create({
          customerId: customerId || null,
          guestToken: guestToken || null,
          lastActivityAt: new Date(),
        });
      }

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error('Get or create cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get cart',
        error: error.message,
      });
    }
  }

  // Add item to cart
  async addItem(req, res) {
    try {
      const { cartId } = req.params;
      const { productId, variantId, quantity, unitPrice, distributorId } = req.body;

      const cart = await Cart.findByPk(cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      // Check if item already exists in cart
      const existingItem = await CartItem.findOne({
        where: {
          cartId,
          productId,
          variantId: variantId || null,
        },
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        await existingItem.update({
          quantity: newQuantity,
          totalPrice: newQuantity * parseFloat(unitPrice),
        });

        await cart.touch();

        return res.status(200).json({
          success: true,
          message: 'Cart item updated',
          data: existingItem,
        });
      }

      // Create new cart item
      const cartItem = await CartItem.create({
        cartId,
        productId,
        variantId,
        quantity,
        unitPrice,
        totalPrice: quantity * parseFloat(unitPrice),
        distributorId,
      });

      await cart.touch();

      return res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
        error: error.message,
      });
    }
  }

  // Update cart item quantity
  async updateItemQuantity(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cartItem = await CartItem.findByPk(itemId);

      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found',
        });
      }

      await cartItem.update({
        quantity,
        totalPrice: quantity * parseFloat(cartItem.unitPrice),
      });

      // Update cart activity
      const cart = await Cart.findByPk(cartItem.cartId);
      if (cart) {
        await cart.touch();
      }

      return res.status(200).json({
        success: true,
        message: 'Cart item quantity updated',
        data: cartItem,
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: error.message,
      });
    }
  }

  // Remove item from cart
  async removeItem(req, res) {
    try {
      const { itemId } = req.params;

      const cartItem = await CartItem.findByPk(itemId);

      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found',
        });
      }

      const cartId = cartItem.cartId;
      await cartItem.destroy();

      // Update cart activity
      const cart = await Cart.findByPk(cartId);
      if (cart) {
        await cart.touch();
      }

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Remove cart item error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart',
        error: error.message,
      });
    }
  }

  // Clear cart
  async clearCart(req, res) {
    try {
      const { cartId } = req.params;

      const cart = await Cart.findByPk(cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      await CartItem.destroy({ where: { cartId } });
      await cart.touch();

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error.message,
      });
    }
  }

  // Get cart with items
  async getCart(req, res) {
    try {
      const { cartId } = req.params;

      const cart = await Cart.findByPk(cartId, {
        include: [
          {
            model: CartItem,
            as: 'items',
          },
        ],
      });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error('Get cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch cart',
        error: error.message,
      });
    }
  }

  // Merge guest cart with customer cart on login
  async mergeCart(req, res) {
    try {
      const { guestToken, customerId } = req.body;

      // Find guest cart
      const guestCart = await Cart.findOne({
        where: { guestToken, status: 'active' },
        include: [{ model: CartItem, as: 'items' }],
      });

      if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No guest cart to merge',
        });
      }

      // Find or create customer cart
      let customerCart = await Cart.findOne({
        where: { customerId, status: 'active' },
      });

      if (!customerCart) {
        customerCart = await Cart.create({
          customerId,
          lastActivityAt: new Date(),
        });
      }

      // Move items from guest cart to customer cart
      for (const item of guestCart.items) {
        const existingItem = await CartItem.findOne({
          where: {
            cartId: customerCart.id,
            productId: item.productId,
            variantId: item.variantId,
          },
        });

        if (existingItem) {
          // Update quantity
          await existingItem.update({
            quantity: existingItem.quantity + item.quantity,
          });
          await existingItem.updateTotalPrice();
        } else {
          // Move item to customer cart
          await item.update({ cartId: customerCart.id });
        }
      }

      // Mark guest cart as merged
      await guestCart.update({ status: 'merged' });

      return res.status(200).json({
        success: true,
        message: 'Cart merged successfully',
        data: customerCart,
      });
    } catch (error) {
      console.error('Merge cart error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to merge cart',
        error: error.message,
      });
    }
  }

  // Apply coupon to cart
  async applyCoupon(req, res) {
    try {
      const { cartId } = req.params;
      const { couponCode } = req.body;

      const cart = await Cart.findByPk(cartId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      // TODO: Validate coupon and calculate discount
      await cart.update({
        couponCode,
      });

      return res.status(200).json({
        success: true,
        message: 'Coupon applied successfully',
        data: cart,
      });
    } catch (error) {
      console.error('Apply coupon error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to apply coupon',
        error: error.message,
      });
    }
  }

  // Get abandoned carts (Admin)
  async getAbandonedCarts(req, res) {
    try {
      const { page = 1, limit = 20, hours = 24 } = req.query;
      const offset = (page - 1) * limit;

      const abandonedTime = new Date(
        Date.now() - hours * 60 * 60 * 1000
      );

      const { count, rows } = await Cart.findAndCountAll({
        where: {
          status: 'active',
          lastActivityAt: {
            [Op.lt]: abandonedTime,
          },
        },
        include: [{ model: CartItem, as: 'items' }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['lastActivityAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get abandoned carts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch abandoned carts',
        error: error.message,
      });
    }
  }
}

module.exports = new CartController();
