from order.models import Order, OrderItem
from django.db.models import Sum, Count

class OrderDAO():

    def getAllOrder():
        order_qset = Order.objects.all() #get all order
        return order_qset

    def getAllOrderByUser(user):
        order_qset = Order.objects.filter(user = user) #get all order
        return order_qset

    def getOrderByID(order_id):
        order = Order.objects.get(pk= order_id)
        return order

    def getAnOrderItemByID(id):
        orderItem = OrderItem.objects.get(pk = id)
        return orderItem

    def getAllOrderItemByOrder(order):
        orderItemList = OrderItem.objects.filter(order = order)
        return orderItemList

    def getActiveOrderByStatus(status):
        orderList = Order.objects.filter(status=status, active=True)
        return orderList

    def getOrderGroupByUser(status):
        result = Order.objects.filter(status=status, active=True).values('user').annotate(total_price=Sum('totalPrice')).order_by('-total_price')
        return result

    def getOrderGroupByProduct(status):
        orderList = Order.objects.filter(status=status, active=True)
        orderItemList = OrderItem.objects.filter(order__in = orderList).values('item__product').annotate(sum=Sum('quantity')).order_by('-sum')
        return orderItemList

    def filterOrder(username,idcontain,status,orderField,orderType):
        if orderType == 'descending':
            orderField = '-'+orderField
        
        if status >= 0 and status <= 3:
            orderList = Order.objects.filter(pk__icontains=idcontain, user__username__icontains=username,
                status=status, active=True).order_by(orderField)
        else:
            if status == -1:
                orderList = Order.objects.filter(pk__icontains=idcontain,
                    user__username__icontains=username).order_by(orderField)
            if status == 4:
                orderList = Order.objects.filter(pk__icontains=idcontain,
                    user__username__icontains=username, active=False).order_by(orderField)
        return orderList

    def filterOrderByUser(user,idcontain,status,orderField,orderType):
        if orderType == 'descending':
            orderField = '-'+orderField
        
        if status >= 0 and status <= 3:
            orderList = Order.objects.filter(pk__icontains=idcontain, user=user,
                status=status, active=True).order_by(orderField)
        else:
            if status == -1:
                orderList = Order.objects.filter(pk__icontains=idcontain,
                    user=user).order_by(orderField)
            if status == 4:
                orderList = Order.objects.filter(pk__icontains=idcontain,
                    user=user, active=False).order_by(orderField)
        return orderList

    def createOrder(clientName, tel, shippingAddress, detail, totalPrice, user):
        order = Order(clientName = clientName, tel = tel, shippingAddress = shippingAddress, detail = detail, 
        totalPrice = totalPrice, user = user)
        return order

    def createOrderItem(order, item, quantity, totalPrice):
        orderItem = OrderItem(order = order, item = item, quantity = quantity, totalPrice = totalPrice)
        return orderItem

    def saveOrder(order):
        order.save()
    
    def saveOrderItem(orderItem):
        orderItem.save()

    def deleteOrderItem(orderItem):
        orderItem.delete()

    def deleteOrder(order):
        order.delete()