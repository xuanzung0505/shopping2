from product.models import Category

class CategoryDAO():
    def createCategory(title, description, active):
        category = Category.objects.create(title=title, description=description, active=active)
        return category
        
    def getActiveCategory():
        categoryList = Category.objects.filter(active=True)
        return categoryList

    def getCategoryByID(category_id):
        category = Category.objects.get(pk=category_id)
        return category

    def getAllCategory():
        categoryList = Category.objects.all()
        return categoryList

    def saveCategory(category):
        category.save()
        return category

    def deleteCategory(category):
        category.delete()