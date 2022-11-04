from django.contrib.auth.models import User, UserManager
from user.models import MyUser

class UserDAO():
    def getAllUser():
        userList = User.objects.all()
        return userList

    def getUserByID(user_id):
        user = User.objects.get(pk=user_id)
        return user

    def getMyUserByUser(user):
        myUser = MyUser.objects.get(user=user)
        return myUser

    def saveUser(user):
        user.save()

    def saveMyUser(myUser):
        myUser.save()

    def createUser(username, password, email, tel):
        #check username
        userList = User.objects.filter(username=username)
        if userList.count() == 0:
            #check email
            myUserList = MyUser.objects.filter(email=email)
            if myUserList.count() == 0:
                #create
                user = User.objects.create_user(username=username, password=password)
                myUser = MyUser.objects.create(user=user,email=email,tel=tel)
                return user
            else:
                return None
        else:
            return None

    def createMyUser(user, email, tel):
        myUserList = MyUser.objects.filter(email=email)
        if myUserList.count() == 0:
            #create
            myUser = MyUser.objects.create(user=user,email=email,tel=tel)
            return myUser
        else:
            return None

    def filterUser(idcontain,username,email,authorize,active,orderField,orderType):
        if orderField == 'email':
            orderField = 'myuser__' + orderField
        
        if orderType == 'descending':
            orderField = '-'+orderField
        
        #authorize = all -> no filter
        #authorize = staff -> is_staff = True
        #authorize = superuser -> is_superuser = True

        if authorize == 'all':
            userList = User.objects.filter(pk__icontains=idcontain, username__icontains = username, myuser__email__icontains =
        email, is_active=active).order_by(orderField)

        if authorize == 'client':
            userList = User.objects.filter(pk__icontains=idcontain, username__icontains = username, myuser__email__icontains =
        email, is_staff=False, is_active=active).order_by(orderField)

        if authorize == 'staff':
            userList = User.objects.filter(pk__icontains=idcontain, username__icontains = username, myuser__email__icontains =
        email, is_staff=True, is_active=active).order_by(orderField)

        if authorize == 'superuser':
            userList = User.objects.filter(pk__icontains=idcontain, username__icontains = username, myuser__email__icontains =
        email, is_superuser=True, is_active=active).order_by(orderField)

        return userList

    def checkEmail(email):
        myUserList = MyUser.objects.filter(email=email)
        if myUserList.count() == 0:
            return True
        else:
            return False
       
    def deleteUser(user):
        user.delete()