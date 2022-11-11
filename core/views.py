import traceback
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
from product.serializers import CategorySerializer, ItemSerializer, ProductSerializer, ReviewSerializer
from cart.serializers import CartSerializer, CartItemSerializer
from user.serializers import UserSerializer
from order.serializers import OrderSerializer

#json
import json

#template loader
from django.template.loader import render_to_string

#lib for email auth
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from user.tokens import account_activation_token
from django.contrib import messages

#lib for change password mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator

#only client
admin = False
LOGIN_URL = '/login'

def authen(request):
    if not (request.user.is_authenticated and request.user.is_staff == admin):
        logout(request)
        # return render(request,'admin/loginpage/login.html')
        return False
    return True

def activateEmail(request,user,to_email):
    mail_subject = "kích hoạt tài khoản của bạn"
    message = render_to_string("client/activate_mail/template_activate_account.html", {
        'user': user,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        'protocol': 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, to=[to_email])
    if email.send():
        return "đăng ký thành công, hãy kiểm tra email của bạn (lưu ý thư mục spam)"
    else:
        return "gửi mail xác minh thất bại"

def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = UserDAO.getUserByID(uid)
    except:
        user = None

    if user is not None:
        if account_activation_token.check_token(user,token):
            user.is_active = True
            user.myuser.email_auth = True
            user.save()

            messages.success(request, "tài khoản đã được kích hoạt thành công.")
        else:
            messages.error(request, "link kích hoạt đã hết hạn hoặc hỏng, chúng tôi sẽ gửi lại mail mới")
            activateEmail(request,user,user.myuser.email)
    else:
        messages.error(request, "có lỗi khi kích hoạt tài khoản.")

    return redirect("shopping:login")

def forgotPasswordEmail(request,user,to_email):
    mail_subject = "thay đổi mật khẩu của bạn"
    message = render_to_string("client/forgotpassword_mail/template_forgotpassword.html", {
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
            return redirect("shopping:changeforgotpassword")

        else:
            messages.error(request, "link đổi mật khẩu đã hết hạn hoặc hỏng, chúng tôi sẽ gửi lại mail mới")
            forgotPasswordEmail(request,user,user.myuser.email)
            return redirect("shopping:login")
    else:
        messages.error(request, "có lỗi khi đổi mật khẩu tài khoản.")
        return redirect("shopping:login")

class ForgotPasswordPage(View):
    def get(self, request):
        if (request.user.is_authenticated and request.user.is_staff == admin):
            return render(request,'client/indexpage/index.html')
        return render(request,'client/forgotpasswordpage/forgotpassword.html')
    
    def post(self, request):
        username = request.POST.get('username')
        user = None
        try:
            user = UserDAO.getUserByUsername(username)
        except:
            result = False
            message = 'tài khoản không tồn tại'
            return JsonResponse({'result':result,'msg':message}, status=200, safe=False)
            
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
            return render(request,'client/indexpage/index.html')
        try:
            uidb64 = request.session.pop('uidb64')
            token = request.session.pop('token')
            user = request.session.pop('user')
            request.session.modified = True

            # user = UserSerializer(user)
            # print(user)
            context = {'user':user}

            return render(
                request,'client/changeforgotpasswordpage/changeforgotpassword.html', context)
        except:
            return redirect('shopping:login')

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

class RegisterPage(View):
    def get(self, request):
        if (request.user.is_authenticated and request.user.is_staff == admin):
            return render(request,'client/indexpage/index.html')
        return render(request,'client/registerpage/register.html')
    
    def post(self, request):
        # print(request.POST.get('form'))
        # form = CreateUserForm(request.POST)
        username = request.POST.get('username')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        email = request.POST.get('email')
        tel = request.POST.get('tel')

        # form = CreateUserForm(username=username,password1=password1,password2=password2)
        # print(form.is_valid())
        
        result = False
        message = None
        
        try:
            user = UserDAO.createUser(username=username, password=password1, email=email,tel=tel)
        except:
            result = False
            message = 'không thể đăng ký, hãy thử lại sau'
            print(message)
            return JsonResponse({"result":result, "msg":message}, status=200, safe=False)

        if user:
            result=True
            user.is_active = False
            UserDAO.saveUser(user)
            message = activateEmail(request, user, email)
        else:
            message = 'username hoặc email đã trùng'
            
        print(message)

        return JsonResponse({"result":result, "msg":message}, status=200, safe=False)

#only client
class LoginPage(View):
    def get(self,request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        return render(request,'client/indexpage/index.html')
    
    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        try:
            userdb = UserDAO.findUserByUsername(username)
        except:
            userdb = None

        #check if acc exists
        if userdb:
            #if exists then login
            user = authenticate(request, username=username, password=password)
        else:
            result = False
            message = 'tài khoản không tồn tại'
            return JsonResponse({"result":result, 'msg':message}, status=200, safe=False)

        #login result
        if user:
            if user.is_staff == admin:
                login(request, user)
                result = True
                message = "đăng nhập thành công"
            else:
                result = False
                message = 'chỉ client mới có thể đăng nhập'
        else:
            result = False
            if userdb.is_active:
                message = 'username/mật khẩu không đúng'
            else:
                if userdb.check_password(password):
                    message = 'tài khoản chưa được kích hoạt, vui lòng check mail (kiểm tra thư mục spam)'

                else:
                    message = 'username/mật khẩu không đúng'

        return JsonResponse({"result":result, 'msg':message}, status=200, safe=False)

class LogoutPage(View):
    def get(self,request):
        logout(request)
        return render(request,'client/loginpage/login.html')

#only client
class IndexPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        return render(request,'client/indexpage/index.html')

class CatalogPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        # productList = Product.objects.filter(active=True)
        productList = ProductDAO.getActiveProduct()
        categoryList = CategoryDAO.getActiveCategory()

        productList = ProductSerializer(productList, many=True)
        categoryList = CategorySerializer(categoryList, many=True)

        productList = productList.data
        categoryList = categoryList.data

        context = {"productList":productList, "categoryList": categoryList}
        return render(request,'client/catalogpage/catalog.html',context)

class CatalogSearch(LoginRequiredMixin, View):
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

class CatalogFilter(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, category_id):
        
        if(int(category_id) != 0):
            category = CategoryDAO.getCategoryByID(category_id)
            productList = ProductDAO.searchActiveProductByCategory(category = category, maxSize=0)
            
        else:
            productList = ProductDAO.getActiveProduct()            
        
        
        productList = ProductSerializer(productList, many=True)
        productList = productList.data
        # size = int(product_qset.count())

        return JsonResponse(productList, status=200, safe=False)

class ItemDetailPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request, item_id):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        # product = Product.objects.get(pk=product_id)
        item = ProductDAO.getProductByID(item_id)
        if not item.active:
            return redirect("shopping:catalog")
        
        imgPathList = ProductDAO.getImgPathByProduct(item)

        relatedProductList = ProductDAO.searchRelatedProductByCategory(product=item, category=item.category, maxSize=2)
        print(relatedProductList)
        # print(item)
        # print(imgPathList)
        # print(relatedProductList)
        
        attrList = ProductDAO.getAttributeListByProduct(product=item)

        attrListTmp = []
        index = 0

        if attrList:
            for attr in attrList:
                try:
                    attrValue = ProductDAO.getAttributeValueListByAttribute(attribute=attr)
                    attrValueListTmp = []
                    for value in attrValue:
                        attrValueListTmp.append(value)

                    attr = {"index": index, "title":attr.title, "value":attrValueListTmp}
                    attrListTmp.append(attr)
                    index += 1
                except:
                    traceback.print_exc()

        user = request.user

        reviewStatus = ProductDAO.getReviewStatus(user=user, product=item)

        canReview = False
        if reviewStatus.count() > 0:
            for reviewStat in reviewStatus:
                if reviewStat.canReview:
                    canReview = True

        reviewList = ProductDAO.getAllReviewByProduct(product=item)
        
        #get rating by product
        totalStar = 0
        for review in reviewList:
            totalStar = totalStar + review.rating

        reviewList = ReviewSerializer(reviewList, many=True)
        reviewList = reviewList.data

        item = ProductSerializer(item)
        item = item.data
        
        # if len(relatedProductList) > 1:
        #     relatedProductList = ProductSerializer(relatedProductList, many=True)
        # else:
        relatedProductList = ProductSerializer(relatedProductList, many=True)

        relatedProductList = relatedProductList.data

        context = {"item":item, "imgpathlist":imgPathList, "relatedproductlist": relatedProductList, "attrlist":attrListTmp,
        "canReview":canReview, "reviewlist":reviewList, "totalStar": totalStar}

        return render(request,'client/productdetailpage/productdetail.html',context)

    def post(self, request, item_id): #get variance
        # product = Product.objects.get(pk=product_id)
        product_id = item_id

        product = ProductDAO.getProductByID(product_id)
        selectedAttr = request.POST.get('selectedAttr')
        print(selectedAttr)

        # if selectedAttr is
        if selectedAttr:
            selectedAttr = json.loads(selectedAttr)

        attr = ''
        # print(type(selectedAttr))
        attrSize = len(selectedAttr)
        print(attrSize)
        for i in range(attrSize):
            attr = attr +selectedAttr.get('attribute'+str(i))+','    
        
        print(attr) 
        item = ItemDAO.searchActiveItemByAttr(product,attr)
        
        print(item)
        item = serializers.serialize('json', item)

        return JsonResponse({"variance":item},status=200,safe=False)

class AddToCart(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, variance_id): #get variance
        # product = Product.objects.get(pk=product_id)

        variance = ItemDAO.getItemByID(variance_id)
        quantity = int(request.POST.get('quantity'))

        print(quantity)

        #add a cart item to cart

        #get the cart from user credentials
        user = request.user
        
        cart_qset = CartDAO.getCartByUser(user) #get the ONLY cart
        # #if none then create new cart
        cart = CartDAO.createCartByUser(user)
        
        for item in cart_qset:
            cart = item #cart could be in cart_qset or new

        CartDAO.saveCart(cart) #saving does not harm

        cartTotalPrice = float(cart.totalPrice)

        #change the cartitem matched with the selected variance
        cartitem_qset = CartDAO.getACartItemByItem(cart, variance)
        
        print(type(variance.unitPrice))
        print(type(quantity)) 

        totalPrice = float(variance.unitPrice) * quantity
        if cartitem_qset.count() == 0: #does not exist
            cartitem = CartDAO.createCartItem(cart, variance, quantity, totalPrice)
            CartDAO.saveCartItem(cartitem)

        else: #exists so add more
            for cartitem in cartitem_qset:
                #save the new quantity
                cartitemquantity = int(cartitem.quantity)
                cartitemquantity += quantity
                cartitem.quantity = cartitemquantity

                #save the new totalPrice
                cartitem.totalPrice = cartitem.item.unitPrice * cartitem.quantity
                CartDAO.saveCartItem(cartitem)

        #add totalprice to carttotal
        cartTotalPrice += totalPrice
        cart.totalPrice = cartTotalPrice
        CartDAO.saveCart(cart)
        
        return JsonResponse({"result":True},status=200,safe=False)

class CartPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        user = request.user

        cart_qset = CartDAO.getCartByUser(user) #get the ONLY cart
        #if none then create new cart
        cart = CartDAO.createCartByUser(user)
        
        for item in cart_qset:
            cart = item
        CartDAO.saveCart(cart)
        
        cartitem_qset = CartDAO.getAllCartItem(cart)
        
        context = { "cart":cart
            ,"cartitem_set":cartitem_qset}

        return render(request,'client/cartpage/cart.html',context)

class CartItemQuantityChange(LoginRequiredMixin, View):
    login_url = '/login'
    def post(self,request,id,quantity):
        user = request.user
            
        cartItem = CartDAO.getACartItemByID(id)
        cart_qset = CartDAO.getCartByUser(user)

        for item in cart_qset:
            cart = item

        #save new cartitem quantity AND totalprice
        cartItemTotalPriceNew = float(cartItem.item.unitPrice) * int(quantity)
        cartItem.quantity = int(quantity)
        cartItem.totalPrice = cartItemTotalPriceNew
        CartDAO.saveCartItem(cartItem)

        #also update the cart
        cartTotalPrice = 0.0
        cartItem_qset = CartDAO.getAllCartItem(cart)
        for cartItem in cartItem_qset:
            cartTotalPrice += float(cartItem.totalPrice)

        cart.totalPrice = cartTotalPrice
        CartDAO.saveCart(cart)

        return JsonResponse({'result':'ok', 'cartItemTotal': str(cartItemTotalPriceNew),
        'cartTotal': str(cartTotalPrice)}, status=200)

class CartItemDelete(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, id):
        user = request.user
        
        cartItem = CartDAO.getACartItemByID(id)
        cart_qset = CartDAO.getCartByUser(user)
        for item in cart_qset:
            cart = item

        cartItemTotalPrice = float(cartItem.totalPrice)
        cartTotalPrice = float(cart.totalPrice) 
        cartTotalPrice -= cartItemTotalPrice
        
        cart.totalPrice = cartTotalPrice
        CartDAO.saveCart(cart)

        CartDAO.deleteCartItem(cartItem)
        return JsonResponse({'result' : 'ok', 'cartTotal' : str(cartTotalPrice)}, status=200)

class CheckoutPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        user = request.user

        cart_qset = CartDAO.getCartByUser(user)
        #if none then create new cart
        cart = CartDAO.createCartByUser(user)
        for item in cart_qset:
            cart = item
        CartDAO.saveCart(cart)

        cartitem_qset = CartDAO.getAllCartItem(cart)
        cart = CartSerializer(cart)
        
        context = { "cart":cart.data
            ,"cartitem_set":cartitem_qset}

        return render(request,'client/checkoutpage/checkout.html', context)
    
    def post(self,request):
        user = request.user

        hoten = request.POST.get('hoten')
        dienthoai = request.POST.get('dienthoai')
        diachi = request.POST.get('diachi')
        thongtin = request.POST.get('thongtin')

        cart_qset = CartDAO.getCartByUser(user)
        for item in cart_qset:
            cart = item

        totalPrice = cart.totalPrice

        order = OrderDAO.createOrder(clientName = hoten, tel = dienthoai, shippingAddress = diachi, detail = thongtin,
        totalPrice = totalPrice, user = user)
        
        try:
            #save order in DB
            OrderDAO.saveOrder(order)

            #create OrderItem and save
            cartItemList = CartDAO.getAllCartItem(cart=cart)
            for cartitem in cartItemList:
                orderItem = OrderDAO.createOrderItem(order = order, item = cartitem.item,
                quantity= cartitem.quantity, totalPrice= cartitem.totalPrice)
                OrderDAO.saveOrderItem(orderItem)

            #delete CartItem
            for cartitem in cartItemList:
                CartDAO.deleteCartItem(cartitem)
                # print("cartitem after delete:")
                # print(cartitem)
            
            cart.totalPrice = 0
            CartDAO.saveCart(cart)
        except: #rollback
            cart.totalPrice = totalPrice
            CartDAO.saveCart(cart)

            for cartitem in cartItemList:
                CartDAO.saveCartItem(cartitem)

            orderItemList = OrderDAO.getAllOrderItemByOrder(order)
            
            for orderItem in orderItemList:
                OrderDAO.deleteOrderItem(orderItem)
            
            OrderDAO.deleteOrder(order)

            return JsonResponse({'result' : False}, status=200)

        # return HttpResponse("hehe")
        # print("ok")
        html = render_to_string('client/successpage/success.html')

        return JsonResponse({'result' : 'ok', 'html':html}, status=200, safe= False)

# class SuccessPage(LoginRequiredMixin, View):
#     login_url=LOGIN_URL
#     def get(self,request):
#         if not authen(request):
#             return render(request,'client/loginpage/login.html')
#         return render(request, "client/successpage/success.html")

class OrderPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        user = request.user

        orderList = OrderDAO.getAllOrderByUser(user)
        orderList = OrderSerializer(orderList, many=True)
        orderList = orderList.data

        context = {"orderList": orderList}
        return render(request, 'client/orderpage/order.html', context)

class OrderFilterPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request):
        orderId = str(request.POST.get("orderId"))
        selectedStatus = int(request.POST.get("selectedStatus"))
        user = request.user

        orderType = str(request.POST.get("orderType"))
        orderField = str(request.POST.get("orderField"))
        orderType = str(request.POST.get("orderType"))

        order = OrderDAO.filterOrderByUser(user=user,idcontain=orderId,status=selectedStatus,orderField=orderField,orderType=orderType)
        order = OrderSerializer(order, many=True)
        order = order.data
        
        return JsonResponse(order,status=200,safe=False)

class OrderDetailPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self, request, order_id):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        order = OrderDAO.getOrderByID(order_id)
        orderItemList = OrderDAO.getAllOrderItemByOrder(order)

        order = OrderSerializer(order)
        order = order.data

        context={"order": order, "orderitemlist":orderItemList}
        return render(request, 'client/orderdetailpage/orderdetail.html', context)

class OrderAbortPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def post(self, request, order_id):
        order = OrderDAO.getOrderByID(order_id)

        if order.status >= 2:
            return JsonResponse({'result':False, 'message':'Đơn đã giao, không thể hủy'},status=200,safe=False)

        order.active = False
        try:
            OrderDAO.saveOrder(order)
        except:
            return JsonResponse({'result':False},status=200,safe=False)
        
        return JsonResponse({'result':True},status=200,safe=False)


class ReviewPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL

    def post(self, request, product_id):
        user = request.user
        product = ProductDAO.getProductByID(product_id)

        rating = request.POST.get("rating")
        title = request.POST.get("title")
        detail = request.POST.get("detail")

        reviewStatusList = ProductDAO.getReviewStatus(user=user,product=product)
        
        canReview = False
        didReview = False
        didBuy = False

        if reviewStatusList.count() > 0:
            for reviewStatus in reviewStatusList:
                didReview = reviewStatus.didReview
                didBuy = True
                if reviewStatus.canReview and didReview == False:
                    canReview = True

        if canReview:            
            review = ProductDAO.createReview(rating=rating,title=title,detail=detail,user=user,product=product)
            try:
                ProductDAO.saveReview(review)
                for reviewStatus in reviewStatusList:
                    reviewStatus.didReview = True
                    ProductDAO.saveReviewStatus(reviewStatus)

                    totalReview = product.totalReview
                    totalReview += 1
                    product.totalReview = totalReview

                    totalStar = product.totalStar
                    totalStar += int(rating)
                    product.totalStar = totalStar

                    ProductDAO.saveProduct(product)
                     
            except:
                return JsonResponse({"result":False}, status=200, safe=False)
            review = ReviewSerializer(review)
            review = review.data

            product = ProductSerializer(product)
            product = product.data

            return JsonResponse({"result":True, "review":review, "product":product}, status=200, safe=False)
        else:
            return JsonResponse({"result":False, "didbuy":didBuy}, status=200, safe=False)

class MyAccountPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        if not authen(request):
            return render(request,'client/loginpage/login.html')
        # productList = Product.objects.filter(active=True)

        user = request.user
        print(user.id)
        userdata = UserSerializer(user, many=False)

        context = {"user":userdata.data}
        return render(request,'client/myaccountpage/myaccount.html',context)

    def post(self,request):
        # productList = Product.objects.filter(active=True)

        user = request.user
        firstname = request.POST.get('firstname')
        lastname = request.POST.get('lastname')
        # email = request.POST.get('email')
        tel = request.POST.get('tel')

        # print(user.first_name)
        # print(user.last_name)

        user.first_name = firstname
        user.last_name = lastname

        # if email and user.myuser.email != email:
        #     #check email
        #     if UserDAO.checkEmail(email):
        #         #myuser = null
        #         # try:
        #         #     myuser = user.myuser
        #         # except:
        #         #     myuser = UserDAO.createMyUser(user=user, email=email, tel=tel)
        #         # user.myuser = myuser

        #         user.myuser.email = email
        #     else:
        #         return JsonResponse({'result':False}, status=200, safe=False)
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

class FAQPage(LoginRequiredMixin, View):
    login_url=LOGIN_URL
    def get(self,request):
        context = {}
        return render(request,'client/FAQpage/FAQ.html', context)