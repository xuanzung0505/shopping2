from product.models import *

class ItemDAO():
    def createItem(title, description, product_id, imgPath, unitPrice, quantity, active):
        newItem = Item.objects.create(title=title, description=description, 
        product = Product.objects.get(pk=product_id), imgPath=imgPath, unitPrice=unitPrice, active=active, quantity=quantity)
        return newItem

    def getActiveItem():
        itemList = Item.objects.filter(active=True)
        return itemList

    def searchActiveItemByName(search_query):
        itemList = Item.objects.filter(title__icontains = search_query, active=True)
        return itemList

    def searchActiveItemByAttr(product, attr):
        item = Item.objects.filter(product=product, attrValue = attr, active=True)
        return item

    def getItemByID(id):
        item = Item.objects.get(pk=id)
        return item
    