from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Item)
admin.site.register(ProductImage)
admin.site.register(ProductAttribute)
admin.site.register(AttributeValue)
admin.site.register(ReviewStatus)
admin.site.register(Review)