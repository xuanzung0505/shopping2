from statistics import variance
from unicodedata import category
from product.models import *

class ProductDAO():
    def createProduct(title, description, category_id, imgPath, unitPrice, quantity, active):
        newProduct = Product.objects.create(title=title, description=description, 
        category = Category.objects.get(pk=category_id), imgPath=imgPath, unitPrice=unitPrice, active=active, quantity=quantity)
        return newProduct

    def createReview(rating, title, detail, user, product):
        review = Review.objects.create(rating = rating, title = title, detail=detail, user=user, product=product)
        return review

    def saveReview(review):
        review.save()

    def createAttributeByProduct(product, title):
        attribute = ProductAttribute.objects.create(product = product, title = title)
        return attribute

    def createReviewStatus(user, product, canReview):
        review = ReviewStatus.objects.create(user=user, product=product, canReview=canReview)
        return review

    def createAttrValueByAttr(attribute, title):
        attrValue = AttributeValue.objects.create(productAttribute = attribute, title = title)
        return attrValue

    def createVariance(title,imgPath,unitPrice,quantity,attrValue,active,product):
        variance = Item.objects.create(title=title,imgPath=imgPath,unitPrice=unitPrice,quantity=quantity,
        attrValue=attrValue,active=active,product=product)
        return variance

    def createImgPath(imgPath, product):
        imgPath = ProductImage.objects.create(imgPath = imgPath, product = product)
        return imgPath

    def saveReviewStatus(reviewStatus):
        reviewStatus.save()

    def saveProduct(product):
        product.save()

    def saveImgPath(productImage):
        productImage.save()

    def saveProductAttribute(productAttr):
        productAttr.save()
    
    def saveProductAttributeVal(productAttrVal):
        productAttrVal.save()

    def saveVariance(variance):
        variance.save()

    def getActiveProduct():
        productList = Product.objects.filter(active=True)
        return productList

    def getAllProduct():
        productList = Product.objects.all()
        return productList

    def getAllVariance(product):
        varianceList = Item.objects.filter(product = product)
        return varianceList
    
    def getVarianceByAttrValue(product,attrValue):
        varianceList = Item.objects.filter(product=product,attrValue=attrValue)
        return varianceList

    def getVarianceByID(id):
        variance = Item.objects.get(pk=id)
        return variance

    def getAttributeByID(id):
        attribute = ProductAttribute.objects.get(pk=id)
        return attribute

    def getAttributeValueByID(id):
        attrValue = AttributeValue.objects.get(pk=id)
        return attrValue

    def searchActiveProductByName(search_query):
        productList = Product.objects.filter(title__icontains = search_query, active=True)
        return productList

    def searchAllProductByName(search_query, categoryId):
        if categoryId == 0:
            productList = Product.objects.filter(title__icontains = search_query)
        else:
            category = Category.objects.get(pk=categoryId)
            productList = Product.objects.filter(title__icontains = search_query, category = category)

        return productList

    def searchActiveProductByCategory(category, maxSize):
        if maxSize == 0:
            productList = Product.objects.filter(category = category, active=True)
        else:
            productList = Product.objects.filter(category = category, active=True)[:maxSize]
        return productList

    def searchAllProductByCategory(category, maxSize):
        if maxSize == 0:
            productList = Product.objects.filter(category = category)
        else:
            productList = Product.objects.filter(category = category)[:maxSize]
        return productList

    def getProductByID(id):
        product = Product.objects.get(pk=id)
        return product

    def getImgPathByProduct(product):
        imgPathList = ProductImage.objects.filter(product=product)
        return imgPathList

    def getImgPathByID(id):
        imgPath = ProductImage.objects.get(pk=id)
        return imgPath

    def searchRelatedProductByCategory(product, category, maxSize):
        object_id_list = [product.pk]
        productList = Product.objects.filter(category = category, active=True)

        if maxSize == 0:
            productList = productList.exclude(id__in=object_id_list)
        else:
            productList = productList.exclude(id__in=object_id_list)[:maxSize]

        return productList

    def getAttributeListByProduct(product):
        attrList = ProductAttribute.objects.filter(product = product)
        return attrList

    def getAttributeValueListByAttribute(attribute):
        attrValueList = AttributeValue.objects.filter(productAttribute = attribute)
        return attrValueList

    def getReviewStatus(user, product):
        reviewStatus = ReviewStatus.objects.filter(user = user, product = product)
        return reviewStatus

    def getAllReviewByProduct(product):
        reviewList = Review.objects.filter(product = product)
        return reviewList

    def getAllReviewByActiveProduct():
        reviewList = Review.objects.filter(product__active=True)
        return reviewList

    def getProductByCategory(category):
            productList = Product.objects.filter(category = category)
            return productList

    def deleteAttributeValue(attrVal):
        attrVal.delete()

    def deleteAttribute(attr):
        attr.delete()

    def deleteVariance(variance):
        variance.delete()

    def deleteImgPath(productImage):
        productImage.delete()