import traceback
from django.shortcuts import render
from django.shortcuts import redirect, render, HttpResponse
from django.views import View
from django.http import JsonResponse

#authentication
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin

#DAO
from businesslogic.itemDAO.ItemDAO import ItemDAO
from businesslogic.productDAO.ProductDAO import ProductDAO
from businesslogic.categoryDAO.CategoryDAO import CategoryDAO
from businesslogic.cartDAO.CartDAO import CartDAO
from businesslogic.orderDAO.OrderDAO import OrderDAO
from businesslogic.userDAO.UserDAO import UserDAO

#serializer
from django.core import serializers
from order.serializers import OrderSerializer, OrderItemSerializer
from product.serializers import CategorySerializer, ItemSerializer, ProductSerializer, ReviewSerializer
from cart.serializers import CartSerializer, CartItemSerializer
from user.serializers import UserSerializer

#json
import json

#models sum
from django.db.models import Sum

#template loader
from django.template.loader import render_to_string

#lib for email auth
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from django.contrib import messages

#lib for change password mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator

admin = True
LOGIN_URL = '/admin/login'

def authen(request):
    if not (request.user.is_authenticated and request.user.is_staff == admin):
        logout(request)
        # return render(request,'admin/loginpage/login.html')
        return False
    return True

def forgotPasswordEmail(request,user,to_email):
    mail_subject = "thay đổi mật khẩu của bạn"
    message = render_to_string("admin/forgotpassword_mail/template_forgotpassword.html", {
        'user': user,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': PasswordResetTokenGenerator().make_token(user),
        'protocol': 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    if email.send():
        return "gửi mail thành công, hãy kiểm tra email của bạn (lưu ý thư mục spam)"
    else:
        return "gửi mail đổi mật khẩu thất bại"

def forgotPassword(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = UserDAO.getUserByID(uid)
    except:
        user = None

    if user is not None:
        if PasswordResetTokenGenerator().check_token(user,token):
            # user.is_active = True
            # user.myuser.email_auth = True
            # user.save()
            # messages.success(request, "tài khoản đã được kích hoạt thành công.")
            serializedUser = UserSerializer(user)
            serializedUser = serializedUser.data

            request.session['uidb64'] = uidb64
            request.session['token'] = token
            request.session['user'] = serializedUser
            return redirect("admin:changeforgotpassword")

        else:
            messages.error(request, "link đổi mật khẩu đã hết hạn hoặc hỏng, chúng tôi sẽ gửi lại mail mới")
            forgotPasswordEmail(request,user,user.myuser.email)
            return redirect("admin:login")
    else:
        messages.error(request, "có lỗi khi đổi mật khẩu tài khoản.")
        return redirect("admin:login")

class ForgotPasswordPage(View):
    def get(self, request):
        if (request.user.is_authenticated and request.user.is_staff == admin):
            return render(request,'admin/indexpage/index.html')
        return render(request,'admin/forgotpasswordpage/forgotpassword.html')
    
    def post(self, request):
        username = request.POST.get('username')
        user = UserDAO.getUserByUsername(username)
        
        if user:
            if user.is_staff == admin:
                result = True
                message = forgotPasswordEmail(request, user, user.myuser.email)
                return JsonResponse({'result':result,'msg':message}, status=200, safe=False)
            else:
                result = False
                message = 'tài khoản tồn tại nhưng không được cấp quyền'
                return JsonResponse({'result':result,'msg':message}, status=200, safe=False)
        else:
            result = False
            message = 'tài khoản không tồn tại'
            return JsonResponse({'result':result,'msg':message}, status=200, safe=False)

class ChangeForgotPasswordPage(View):
    def get(self, request):
        if (request.user.is_authenticated and request.user.is_staff == admin):
            return render(request,'admin/indexpage/index.html')
        try:
            uidb64 = request.session.pop('uidb64')
            token = request.session.pop('token')
            user = request.session.pop('user')
            request.session.modified = True

            # user = UserSerializer(user)
            # print(user)
            context = {'user':user}

            return render(
                request,'admin/changeforgotpasswordpage/changeforgotpassword.html', context)
        except:
            return redirect('admin:login')

    def post(self, request):
        userid = int(request.POST.get('userpk'))
        password = str(request.POST.get('password'))
        
        user = UserDAO.getUserByID(userid)
        user.set_password(password)

        try:
            UserDAO.saveUser(user)
        except:
            message = 'đổi mật khẩu thất bại'
            return JsonResponse({'result':False, 'msg':message}, status=200, safe=False)
        
        message = 'đổi mật khẩu thành công'
        return JsonResponse({'result':True, 'msg':message}, status=200, safe=False)

#only admin
class LoginPage(View):
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        return render(request,'admin/indexpage/index.html')
    
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # print("csrfToken:")
        # print(csrfToken)
        user = authenticate(request, username=username, password=password)
        
        result = False
        # print("Staff:"+user.is_staff)
        if user:
            if user.is_staff == admin:
                login(request, user)
                result = True
                message = "đăng nhập thành công"
            else:
                message = 'chỉ admin/staff mới có thể đăng nhập'
        else:
            message = 'username/mật khẩu không đúng'
            
        return JsonResponse({"result":result, "msg":message}, status=200, safe=False)

class LogoutPage(View):
    def get(self,request):
        logout(request)
        return render(request,'admin/loginpage/login.html')

class IndexPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        return render(request,'admin/indexpage/index.html')

class OrderPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        orderList = OrderDAO.getAllOrder()
        orderList = OrderSerializer(orderList, many=True)
        orderList = orderList.data

        context = {"orderList": orderList}
        return render(request, 'admin/orderpage/order.html', context)
        
class OrderFilterPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request):
        username = str(request.POST.get("username"))
        orderId = str(request.POST.get("orderId"))
        selectedStatus = int(request.POST.get("selectedStatus"))

        orderType = str(request.POST.get("orderType"))
        orderField = str(request.POST.get("orderField"))
        orderType = str(request.POST.get("orderType"))

        order = OrderDAO.filterOrder(username=username,idcontain=orderId,status=selectedStatus,orderField=orderField,orderType=orderType)
        order = OrderSerializer(order, many=True)
        order = order.data
        
        # print(order)

        return JsonResponse(order,status=200,safe=False)

class OrderDetailPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request, order_id):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')

        order = OrderDAO.getOrderByID(order_id)
        orderItemList = OrderDAO.getAllOrderItemByOrder(order)

        order = OrderSerializer(order)
        order = order.data

        orderItemList = OrderItemSerializer(orderItemList, many=True)
        orderItemList = orderItemList.data

        context={"order": order, "orderitemlist":orderItemList}
        return render(request, 'admin/orderdetailpage/orderdetail.html', context)

class OrderDetailSubmitPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL

    def post(self,request,order_id):
        order = OrderDAO.getOrderByID(order_id)

        orderStatus = request.POST.get('orderStatus')
        print(orderStatus)

        if orderStatus == 'false':
            if order.status < 2: #can abort
                order.active = False
                try:
                    OrderDAO.saveOrder(order)
                except:
                    return JsonResponse({'result' : False}, status=200, safe= False)

                return JsonResponse({'result' : True}, status=200, safe= False)
            else:
                return JsonResponse({'result' : False, 'message': 'Đơn đã giao, không thể hủy'}, status=200, safe= False)

        hoten = request.POST.get('hoten')
        dienthoai = request.POST.get('dienthoai')
        diachi = request.POST.get('diachi')
        thongtin = request.POST.get('thongtin')
        trangthai = request.POST.get('trangthai')
        totalPrice = request.POST.get('totalPrice')

        deletedItem = request.POST.get('deletedOrderItem')
        editOrderItem = request.POST.get('editOrderItem')
        
        print(deletedItem)
        print(editOrderItem)

        order.clientName = hoten
        order.tel = dienthoai
        order.shippingAddress = diachi
        order.detail = thongtin
        order.status = trangthai
        order.totalPrice = totalPrice
        
        print(order)

        if deletedItem:
            deletedItem = json.loads(deletedItem)
        if editOrderItem:
            editOrderItem = json.loads(editOrderItem)

        try:
            #save order in DB
            OrderDAO.saveOrder(order)

            #save orderitem
            for item in deletedItem:
                # print(item['id'])
                orderItem = OrderDAO.getAnOrderItemByID(item['id'])
                OrderDAO.deleteOrderItem(orderItem)
            for item in editOrderItem:
                # print(item['id'])
                orderItem = OrderDAO.getAnOrderItemByID(item['id'])
                orderItem.quantity = item['quantity']
                OrderDAO.saveOrderItem(orderItem)

        except: #how to handle these?
            return JsonResponse({'result' : False}, status=200)

        return JsonResponse({'result' : True}, status=200, safe= False)

class ProductPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # productList = Product.objects.filter(active=True)
        productList = ProductDAO.getAllProduct()
        categoryList = CategoryDAO.getAllCategory()

        productList = ProductSerializer(productList, many=True)
        categoryList = CategorySerializer(categoryList, many=True)

        productList = productList.data
        categoryList = categoryList.data
        
        context = {"productList":productList, "categoryList": categoryList}
        return render(request,'admin/productpage/product.html',context)

class ProductSearch(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request):
        search_query = request.POST.get("searchQuery")
        categoryId = int(request.POST.get("category"))
        orderField = str(request.POST.get("orderField"))
        orderType = str(request.POST.get("orderType"))
        
        if search_query is None:
            search_query = ''

        # product_qset = Product.objects.filter(title__icontains = search_query, active=True)
        productList = ProductDAO.searchAllProductByName(search_query, categoryId = categoryId, orderField=orderField,
        orderType=orderType)

        productList = ProductSerializer(productList, many=True)
        productList = productList.data

        # size = int(product_qset.count())

        return JsonResponse(productList, status=200, safe=False)

class ProductFilter(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, category_id):
        
        if(int(category_id) != 0):
            category = CategoryDAO.getCategoryByID(category_id)
            productList = ProductDAO.searchAllProductByCategory(category = category, maxSize=0)
            
        else:
            productList = ProductDAO.getAllProduct()         
        
        
        productList = ProductSerializer(productList, many=True)
        productList = productList.data
        # size = int(product_qset.count())

        return JsonResponse(productList, status=200, safe=False)

class ProductDetailPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request, item_id):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # product = Product.objects.get(pk=product_id)
        item = ProductDAO.getProductByID(item_id)
        
        #get Variance
        varianceList = ProductDAO.getAllVariance(item)

        #get imgPath
        imgPathList = ProductDAO.getImgPathByProduct(item)
        
        #get Attr
        attrList = ProductDAO.getAttributeListByProduct(product=item)

        attrListTmp = []
        index = 0 #attr index
        indexVal = 0 #value index

        if attrList:
            for attr in attrList:
                try:
                    attrValue = ProductDAO.getAttributeValueListByAttribute(attribute=attr)
                    attrValueListTmp = []
                    indexVal = 0

                    for value in attrValue:
                        value.index = indexVal
                        attrValueListTmp.append(value)
                        indexVal += 1
                    pk = attr.pk

                    attr = {'id':pk,"index": index, "title":attr.title, "value":attrValueListTmp}
                    attrListTmp.append(attr)
                    index += 1
                except:
                    traceback.print_exc()

        categoryList = CategoryDAO.getActiveCategory()

        item = ProductSerializer(item)
        item = item.data

        varianceList = ItemSerializer(varianceList, many=True)
        varianceList = varianceList.data

        context = {"item":item, "imgpathlist":imgPathList,"attrlist":attrListTmp, "varianceList":varianceList,
        "categoryList": categoryList}

        return render(request,'admin/productdetailpage/productdetail.html',context)
    
    def post(self, request, item_id):
        title = request.POST.get('title')
        unitPrice = request.POST.get('unitPrice')
        description = request.POST.get('description')
        quantity = request.POST.get('quantity')
        category = request.POST.get('category')
        imgPath = request.POST.get('imgPath')
        active = request.POST.get('active')

        product = ProductDAO.getProductByID(item_id)
        product.title = title
        product.unitPrice = unitPrice
        product.description = description
        product.quantity = quantity
        product.category = CategoryDAO.getCategoryByID(category)

        # print(product.category)

        product.imgPath = imgPath
        # print(active)
        if active=="true":
            active = True
        else:
            active = False

        product.active = active

        try:
            ProductDAO.saveProduct(product)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductAddPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        categoryList = CategoryDAO.getActiveCategory()
        context = {"categoryList": categoryList}
        return render(request,'admin/productaddpage/productadd.html', context)

    def post(self, request):
        title = request.POST.get('title')
        unitPrice = request.POST.get('unitPrice')
        description = request.POST.get('description')
        quantity = request.POST.get('quantity')
        category = request.POST.get('category')
        imgPath = request.POST.get('imgPath')
        active = request.POST.get('active')

        if active=="true":
            active = True
        else:
            active = False

        try:
            product = ProductDAO.createProduct(title=title, description=description,category_id= category,
        imgPath=imgPath, unitPrice=unitPrice, quantity=quantity, active=active)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True, 'productPK':product.pk}, status=200, safe=False)

class ProductDeletePage(LoginRequiredMixin, View):
    def post(self, request, item_id):
        product = ProductDAO.getProductByID(item_id)

        try:
            ProductDAO.deleteProduct(product)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True, 'productPK':product.pk}, status=200, safe=False)

class ProductImgPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, img_id):
        path = request.POST.get('path')
        productImg = ProductDAO.getImgPathByID(img_id)
        productImg.imgPath = path
        
        try:
            ProductDAO.saveImgPath(productImg)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductImgAddPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request):
        path = request.POST.get('path')
        product = ProductDAO.getProductByID(request.POST.get('productID'))

        try:
            ProductDAO.createImgPath(imgPath=path, product=product)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductImgDeletePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, img_id):
        productImg = ProductDAO.getImgPathByID(img_id)
        
        try:
            ProductDAO.deleteImgPath(productImg)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductAttributePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, attr_id):
        title = request.POST.get('title')
        attribute = ProductDAO.getAttributeByID(attr_id)
        attribute.title = title
        try:
            ProductDAO.saveProductAttribute(attribute)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductAttributeAddPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, product_id):
        title = request.POST.get('title')
        product = ProductDAO.getProductByID(product_id)

        try:
            pass
            attribute = ProductDAO.createAttributeByProduct(product = product, title= title)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
        
        return JsonResponse({"result":True, "attrPK":attribute.pk}, status=200, safe=False)

class ProductAttributeDeletePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, attr_id):
        attr = ProductDAO.getAttributeByID(attr_id)

        try:
            ProductDAO.deleteAttribute(attr)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
        
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductAttributeValueUpdatePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, attrval_id):
        title = request.POST.get('title')
        attributeVal = ProductDAO.getAttributeValueByID(attrval_id)
        attributeVal.title = title
        try:
            ProductDAO.saveProductAttributeVal(attributeVal)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductAttributeValueAddPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, attr_id):
        title = request.POST.get('title')
        attribute = ProductDAO.getAttributeByID(attr_id)
        
        try:
            attributeVal = ProductDAO.createAttrValueByAttr(attribute = attribute, title = title)
            pass
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True, "valuePK":attributeVal.pk}, status=200, safe=False)

class ProductAttributeValueDeletePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, attrval_id):
        attributeVal = ProductDAO.getAttributeValueByID(attrval_id)
        try:
            ProductDAO.deleteAttributeValue(attributeVal)
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)
            
        return JsonResponse({"result":True}, status=200, safe=False)

class ProductVarianceAddPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request):
        title=request.POST.get("title")
        imgPath=request.POST.get("imgPath")
        unitPrice=request.POST.get("unitPrice")
        quantity=request.POST.get("quantity")
        attrVal=request.POST.get("attrVal")
        active=request.POST.get("active")
        productID = request.POST.get("product")

        product = ProductDAO.getProductByID(productID)

        if attrVal is None:
            attrVal = ''

        if active == "true":
            active = True
        else:
            active = False

        #check if exists attrVal
        varianceList = ProductDAO.getVarianceByAttrValue(product=product, attrValue=attrVal)
        if varianceList.count() == 0:
            try:
                variance = ProductDAO.createVariance(title=title,imgPath=imgPath,unitPrice=unitPrice,
                quantity=quantity,attrValue=attrVal,active=active, product=product)
            except:
                traceback.print_exc()
                return JsonResponse({"result":False}, status=200, safe=False)
            return JsonResponse({"result":True, "variancePK":variance.pk}, status=200, safe=False)
        else:
            return JsonResponse({"result":False}, status=200, safe=False)

class ProductVarianceEditPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, variance_id):
        unitPrice=request.POST.get("unitPrice")
        quantity=request.POST.get("quantity")
        active=request.POST.get("active")
        productID = request.POST.get("product")

        product = ProductDAO.getProductByID(productID)

        if active == "true":
            active = True
        else:
            active = False

        variance = ProductDAO.getVarianceByID(variance_id)
        variance.unitPrice = unitPrice
        variance.quantity = quantity
        variance.active = active
        try:
            ProductDAO.saveVariance(variance)
            pass
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)

        return JsonResponse({"result":True}, status=200, safe=False)

class ProductVarianceDeletePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, variance_id):
        variance = ProductDAO.getVarianceByID(variance_id)
        
        try:
            ProductDAO.deleteVariance(variance)
            pass
        except:
            traceback.print_exc()
            return JsonResponse({"result":False}, status=200, safe=False)

        return JsonResponse({"result":True}, status=200, safe=False)

class UserPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # productList = Product.objects.filter(active=True)
        userList = UserDAO.getAllUser()
        userList = UserSerializer(userList, many=True)
        userList = userList.data
        context = {"userList":userList}
        return render(request,'admin/userpage/user.html',context)

class UserFilterPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request):
        userId = str(request.POST.get("userId"))
        username = str(request.POST.get("username"))
        email = str(request.POST.get("email"))

        authorize = str(request.POST.get("authorize"))
        active = True if str(request.POST.get("active")) =='true' else False

        orderType = str(request.POST.get("orderType"))
        orderField = str(request.POST.get("orderField"))

        user = UserDAO.filterUser(idcontain=userId,username=username,email=email,
        authorize=authorize,active=active,orderField=orderField,orderType=orderType)

        user = UserSerializer(user, many=True)
        user = user.data
        
        # print(order)

        return JsonResponse(user,status=200,safe=False)

class UserDetailPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request,user_id):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # productList = Product.objects.filter(active=True)
        user = UserDAO.getUserByID(user_id)

        userdata = UserSerializer(user, many=False)

        context = {"user":userdata.data}
        return render(request,'admin/userdetailpage/userdetail.html',context)

    def post(self,request,user_id):
        # productList = Product.objects.filter(active=True)
        user = UserDAO.getUserByID(user_id)
        if request.user.username != 'admin' and user.is_staff:
            return JsonResponse({'result':False, 'message':'Bạn chỉ có thể chỉnh sửa trạng thái và phân quyền khách hàng'}, 
            status=200, safe=False)

        active = True if request.POST.get('active')=='true' else False
        staff = True if request.POST.get('staff')=='true' else False
        superuser = True if request.POST.get('superuser')=='true' else False

        user.is_active = active
        user.is_staff = staff
        user.is_superuser = superuser

        try:
            UserDAO.saveUser(user)
        except:
            traceback.print_exc()
            return JsonResponse({'result':False}, status=200, safe=False)

        return JsonResponse({'result':True}, status=200, safe=False)

class MyAccountPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # productList = Product.objects.filter(active=True)

        user = request.user

        userdata = UserSerializer(user, many=False)

        context = {"user":userdata.data}
        return render(request,'admin/myaccountpage/myaccount.html',context)

    def post(self,request):
        # productList = Product.objects.filter(active=True)

        user = request.user
        firstname = request.POST.get('firstname')
        lastname = request.POST.get('lastname')
        email = request.POST.get('email')
        tel = request.POST.get('tel')

        # print(user.first_name)
        # print(user.last_name)

        user.first_name = firstname
        user.last_name = lastname

        if email and user.myuser.email != email:
            #check email
            if UserDAO.checkEmail(email):
                #myuser = null
                # try:
                #     myuser = user.myuser
                # except:
                #     myuser = UserDAO.createMyUser(user=user, email=email, tel=tel)
                # user.myuser = myuser

                user.myuser.email = email
            else:
                return JsonResponse({'result':False}, status=200, safe=False)
        if tel:
            user.myuser.tel = tel

        try:
            UserDAO.saveUser(user)
            UserDAO.saveMyUser(user.myuser)
        except:
            traceback.print_exc()
            return JsonResponse({'result':False}, status=200, safe=False)

        return JsonResponse({'result':True}, status=200, safe=False)

class MyAccountEditPasswordPage(LoginRequiredMixin, View):
    def post(self,request):
        # productList = Product.objects.filter(active=True)

        user = request.user
        password = request.POST.get('password')
        user.set_password(password)

        try:
            UserDAO.saveUser(user)
        except:
            traceback.print_exc()
            return JsonResponse({'result':False}, status=200, safe=False)

        return JsonResponse({'result':True}, status=200, safe=False)

class MyAccountDeactivatePage(LoginRequiredMixin, View):
    def post(self,request):
        # productList = Product.objects.filter(active=True)

        user = request.user
        user.is_active = False

        try:
            UserDAO.saveUser(user)
        except:
            traceback.print_exc()
            return JsonResponse({'result':False}, status=200, safe=False)

        return JsonResponse({'result':True}, status=200, safe=False)

class UserDeletePage(LoginRequiredMixin, View): #stop deleting user like this
    login_url=LOGIN_URL

    def post(self,request,user_id):
        # productList = Product.objects.filter(active=True)
        user = UserDAO.getUserByID(user_id)
        try:
            UserDAO.deleteUser(user)
        except:
            traceback.print_exc()
            return JsonResponse({'result':False}, status=200, safe=False)

        return JsonResponse({'result':True}, status=200, safe=False)

class CategoryPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        categoryList = CategoryDAO.getAllCategory()

        # user = request.user

        # userdata = UserSerializer(user, many=False)

        context = {"categoryList":categoryList}
        return render(request,'admin/categorypage/category.html', context)

class CategoryDetailPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request,category_id):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # productList = Product.objects.filter(active=True)

        category = CategoryDAO.getCategoryByID(category_id)
        category = CategorySerializer(category)
        category = category.data

        context = {"category":category}
        return render(request,'admin/categorydetailpage/categorydetail.html',context)

    def post(self,request,category_id):
        # productList = Product.objects.filter(active=True)
        category = CategoryDAO.getCategoryByID(category_id)

        active = request.POST.get('active')
        title = request.POST.get('title')
        description = request.POST.get('description')

        active = True if active == 'true' else False

        category.active = active
        category.title = title
        category.description = description

        try:
            category = CategoryDAO.saveCategory(category)
        except:
            return JsonResponse({'result':False},status=200,safe=False)

        productList = ProductDAO.getProductByCategory(category)
        try:
            for product in productList:
                product.active = category.active
                ProductDAO.saveProduct(product)
        except:
            return JsonResponse({'result':False, 'message':'Một số sản phẩm không thể cập nhật trạng thái theo danh mục, '
            +'vui lòng kiểm tra lại dữ liệu'},status=200,safe=False)

        return JsonResponse({'result':True},status=200,safe=False)

class CategoryAddPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        # productList = Product.objects.filter(active=True)

        return render(request,'admin/categoryaddpage/categoryadd.html')

    def post(self,request):
        # productList = Product.objects.filter(active=True)

        active = request.POST.get('active')
        title = request.POST.get('title')
        description = request.POST.get('description')

        active = True if active == 'true' else False

        try:
            category = CategoryDAO.createCategory(title=title, description=description, active=active)
        except:
            return JsonResponse({'result':False},status=200,safe=False)

        return JsonResponse({'result':True, 'categoryPK':category.pk},status=200,safe=False)

class CategoryDeletePage(LoginRequiredMixin, View):
    login_url=LOGIN_URL

    def post(self,request,category_id):
        # productList = Product.objects.filter(active=True)
        category = CategoryDAO.getCategoryByID(category_id)

        try:
            CategoryDAO.deleteCategory(category)
        except:
            return JsonResponse({'result':False},status=200,safe=False)

        return JsonResponse({'result':True, 'categoryPK':category.pk},status=200,safe=False)

class StatisticsPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'admin/loginpage/login.html')
        ###stats for profit
        successfulOrderList = OrderDAO.getActiveOrderByStatus(3)
        totalPrice = successfulOrderList.aggregate(Sum('totalPrice'))
        # print(totalPrice)
        totalPrice = totalPrice.get('totalPrice__sum')

        ###stat for clients
        clientResult = OrderDAO.getOrderGroupByUser(3)
        print(clientResult)
        
        for item in clientResult:
            clientStat = item
            break
        
        client = UserDAO.getUserByID(clientStat.get('user'))
        clientTotalPrice = clientStat.get('total_price')
        # print(client)
        # print(clientTotalPrice)

        ###stat for products
        productResult = OrderDAO.getOrderGroupByProduct(3)
        print(productResult)

        for item in productResult:
            productStat = item
            break
        
        product = ProductDAO.getProductByID(productStat.get('item__product'))
        productQuantity = productStat.get('sum')

        ###validate data
        client = UserSerializer(client)
        client = client.data

        product = ProductSerializer(product)
        product = product.data
        # print(client)

        context = {"successfulorderlist":successfulOrderList,
        "totalprice":totalPrice,
        "client":client,
        "clienttotalprice":clientTotalPrice,
        "product":product,
        "productquantity":productQuantity,}
        return render(request,'admin/statisticspage/statistics.html', context)

class FAQPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        context = {}
        return render(request,'admin/FAQpage/FAQ.html', context)