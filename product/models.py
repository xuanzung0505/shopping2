from django.db import models

from django.contrib.auth.models import User

# Create your models here.

class Category(models.Model):
    title = models.CharField(default='', max_length=255)
    description = models.TextField(default='')
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Product(models.Model):
    title = models.CharField(default='', max_length=255)
    unitPrice = models.FloatField(default=0)
    quantity = models.IntegerField(default=0)
    description = models.TextField(default='', null=True)
    active = models.BooleanField(default=True)
    totalReview = models.IntegerField(default=0)
    totalStar = models.IntegerField(default=0)
    imgPath = models.CharField(default='', max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        item = Item.objects.filter(product = self)
        print("item")
        print(item.count())
        
        #auto-add a new Item if there's no Item
        if item.count() == 0:
            newItem = Item.objects.create(title=self.title, description=self.description, 
            product = self, imgPath=self.imgPath, unitPrice=self.unitPrice, active=self.active, quantity=self.quantity)
            # newItem.save()
            print('created item')
            

class Item(models.Model):
    title = models.CharField(default='', max_length=255)
    unitPrice = models.FloatField(default=0)
    quantity = models.IntegerField(default=0)
    description = models.TextField(default='', null=True)
    active = models.BooleanField(default=True)
    imgPath = models.CharField(default='', max_length=255)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    attrValue = models.CharField(default='', max_length=255, blank=True)

    def __str__(self):
        return "["+self.attrValue+"]"+self.title

class ProductImage(models.Model):
    imgPath = models.CharField(default='', max_length=255)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

class ProductAttribute(models.Model):
    title = models.CharField(default='', max_length = 255)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    def __str__(self):
        return str(self.pk)+"["+self.title+"]"+self.product.title

class AttributeValue(models.Model):
    title = models.CharField(default='', max_length = 255)
    productAttribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.title

class ReviewStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    canReview = models.BooleanField(default=False)
    didReview = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'product_reviewstatus'
        constraints = [
            models.UniqueConstraint(fields=['user', 'product'], name='unique1')
        ]

class Review(models.Model):
    title = models.CharField(default='', max_length = 255)
    detail = models.TextField(default='')
    rating = models.IntegerField(default=0)
    create_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='reviews',on_delete=models.CASCADE)    