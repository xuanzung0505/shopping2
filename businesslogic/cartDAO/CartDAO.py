from cart.models import Cart, CartItem

class CartDAO():

    def createCartByUser(user):
        cart = Cart(user=user)
        return cart

    def getAllCart():
        cart_qset = Cart.objects.all() #get the carts
        return cart_qset

    def getCartByUser(user):
        cart_qset = Cart.objects.filter(user = user)
        return cart_qset

    def getACartItemByID(id):
        cartItem = CartItem.objects.get(pk = id)
        return cartItem

    def getACartItemByItem(cart, item):
        cartitem_qset = CartItem.objects.filter(cart = cart, item = item) #cartitem query set ONLY 1
        return cartitem_qset

    def createCartItem(cart, item, quantity, totalPrice):
        cartitem = CartItem(cart = cart, item = item, quantity = quantity, totalPrice = totalPrice) 
        return cartitem

    def getAllCartItem(cart):
        cartitem_qset = CartItem.objects.filter(cart = cart) #get all cartitems in that cart
        return cartitem_qset

    def setOrdered(cart, ordered):
        cart.is_ordered = ordered

    def saveCart(cart):
        cart.save()

    def saveCartItem(cartItem):
        cartItem.save()

    def deleteCartItem(cartItem):
        cartItem.delete()
        
