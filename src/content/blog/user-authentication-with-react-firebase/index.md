---
title: "User Authentication in ReactJS using Firebase"
summary: "This is an attempt to give you a step by step tutorial to handle user authentication in ReactJS using Firebase."
date: "Sep 13 2021"
draft: false
tags:
- Tutorial
- Firebase
- Reactjs
---

This is an attempt to give you a step by step tutorial to handle user authentication in ReactJS using Firebase.

If you face any issues throughout the tutorial, you can refer to the code in the [GitHub repository](https://github.com/khalatevarun/react-auth-firebase.git) .

Our goal is to build a simple project which displays a message after successful login or creation of new account along with the username.

Here is a quick preview

![react-firebase-authentication-preview.gif](https://cdn.hashnode.com/res/hashnode/image/upload/v1631653926924/5u4a6M-Oh.gif)

# Prerequisites

* Node.js installed
    
* Code editor — I prefer Visual Studio Code
    
* Google account — To use Firebase
    
* Basic knowledge of React
    

# Steps to achieve our goal

1. Project Setup with CRA
    
2. Setting up Firebase
    
3. Integrating Firebase into our React app
    
4. Create login/signup form and display message.
    
5. Conclusion
    

# 1. Project Setup with CRA

Lets start by creating the react app. To do the same open your code editor's terminal and start by executing this command to install the react app.

```plaintext
npx create-react-app react-auth-firebase
```

Now that your project is set up go to the project directory you just created ( i.e. react-firestore ) and start the react app using the following commands.

```plaintext
cd react-auth-firebase
npm start
```

This should fire up your browser and you should see the following screen

![react_app_setup.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631528820112/8ZNjcq_Rs.png)

Your newly created project's folder structure should be similar to the image below.

![react_folder_structure.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631529059490/ATUPjPAKB.png)

Now, let's do some cleanup and delete some files from the src folder.

* App.test.js
    
* logo.svg
    
* setupTests.js
    

Once you delete these files, delete all the contents of `App.css` and remove the logo imports in `App.js` and empty the div so that your `App.js` looks like this

```javascript
import './App.css';

function App() {
  return (
    <div className="app">
    </div>
  );
}

export default App;
```

# 2. Setting up Firebase

### 1. Create a Firebase project

Before we code the login/signup form on our React app we need to add a project to the Firebase on the [Firebase Console](https://console.firebase.google.com/). Make sure you are logged into your Google account.

Click on the **Add Project** card which will take you to a 3 steps process.

![step1.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1631532289316/XbKH96XNM.jpeg)

Here you have to enter the name of your project ( you are free to choose any name for your project ). After entering the name click on continue to go to the next step.

![step2.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1631532443632/vNjpeVPlU.jpeg)

We don't need Google analytics for this project so you can just disable it by clicking on the toggle button. After disabling, click on **Create project** button and wait for the project to setup.

### 2. Register an app in your firebase project

We need to select the type of app to configure our firebase project.

![register_app.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631533893128/gN6CZ7hLx.png)

Click on the web app icon to which the arrow is pointing. And it will prompt you to register your app.

![register_app_1.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631540683375/aBQ9IlPyX.png)

Enter the name of the app ( again, you are free to choose any name for the app ) and click on continue.

![register_app_2.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631541516173/VQqEAmFHs.png)

Okay so as of now lets skip this process now and click on the **Continue to console** button and you will be redirected to the dashboard.

### 3. Enable sign in method in Authentication

Lets go back to the firebase console. Go the **Authentication** menu in the right and click on **Get started**.

![auth_step2.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1631600760050/zbKCXVSpK.jpeg)

Here you can see all the sign in providers which you can be used to authenticate users. In this project we will be sticking to **Email/password** sign in method. Click on the first option to enable it.

![auth_step3.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1631600681460/7tNUo3FL9.jpeg)

Click on the **enable** toggle button followed by the **save** button.

# 3. Integrating Firebase into our React app

Click on the settings icons ( ⚙️ ) next to **Project Overview** and select **Project Settings** and scroll down.

![sdk_setup.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631542913934/iRKDbWXdu.png)

As seen in the image above, select the **Config** option and copy the code.

Go to your project directory. Inside src folder create a new file named `firebase.js`

Paste the code in firebase.js file.

Now, lets install the firebase SDK by running the following command in our project directory.

```bash
npm install firebase
```

Lets make some changes in the firebase.js file.

1. Import firebase to initialize the app and the authentication service

```javascript
import firebase from 'firebase/compat';
```

2. Initialize the app and authentication service

```javascript
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
```

3. Export the service

```javascript
export { auth };
```

This is how your `firebase.js` file should look like.

```javascript
import firebase from 'firebase/compat';

const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};

const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();

export { auth };
```

# 4. Create login/signup form and display message.

Now that we have enabled the Email/password sign-in method, we will be using following functions to handle user authentication.

- signInWithEmailAndPassword
- createUserWithEmailAndPassword
- signOut

Lets add these functions in our app by copying the following code in `App.js`

```javascript
import './App.css';
import { useState } from 'react';
import { auth } from './firebase';

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('Guest');
    const [loggedIn, setLoggedIn] = useState(false);

    const signIn = (event) => {
        event.preventDefault();
        auth
            .signInWithEmailAndPassword(email, password)
            .then((auth) => {
                setMessage('You have successfully logged in!');
                setLoggedIn(true);
                setUsername(auth.user.email);
                resetForm();
            })
            .catch((error) => alert(error.message));
    };

    const register = (event) => {
        event.preventDefault();
        auth
            .createUserWithEmailAndPassword(email, password)
            .then((auth) => {
                setMessage('Your account has been created successfully!');
                setLoggedIn(true);
                setUsername(auth.user.email);
                resetForm();
            })
            .catch((error) => alert(error.message));
    };

    const signOutUser = () => {
        auth
            .signOut()
            .then(() => {
                setMessage('Hello there!');
                setUsername('Guest');
                setLoggedIn(false);
            })
            .catch((error) => alert(error.message));
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
    };

    return (
        <div className="app">
            <h1>Hello {username}</h1>
            {!loggedIn ? (
                <div className="app__container">
                    <h1>Sign-in</h1>
                    <form>
                        <h5>E-mail</h5>
                        <input
                            type="text"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        <h5>Password</h5>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        <button onClick={signIn} type="submit" className="app_singInButton">
                            Sign In
                        </button>
                        <button onClick={register} type="submit" className="app_registerButton">
                            Create your account
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <h1>{message}</h1>
                    <button onClick={signOutUser}>Sign Out</button>
                </>
            )}
        </div>
    );
}

export default App;
```

### State variables

- email, password - To store the email and password entered in the form and pass as arguments to the functions.
- message - To display a corresponding message after a successful sign in or creation of new account
- username - To store the username/email of the user once signed in or registered, with a default value of 'Guest'.
- loggedIn - To keep a track whether the user is signed in or signed out and render the components depending on the status of the user.

### Functions

1. signIn() - This function is called after clicking on the **Sign In** button. In this function we are using **signInWithEmailAndPassword()** to check if user has an account already and wants to sign in. If the login credentials are correct then a corresponding successful message is displayed else the error is displayed by the alert function.

2. register() - This function is called after clicking on the **Create your account** button. In this function we are using **createUserWithEmailAndPassword()** to help user create a new account. If the email entered does not have an account registered already then a successful message is displayed else the error is displayed by the alert function.

3. signOutUser() - This function is called after clicking on the **logout** button. In this function we are using **signOut()** which signs out the user from the app.

4. resetForm() - This function is used to empty the form after successful sign in or registration.

Lets add some styling to our app. Copy the following code in `App.css`.

```css
.app {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 100vh;
    background-color: #222;
}

.app > h1 {
    color: white;
}

.app__container {
    width: 300px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    border: 1px solid lightgray;
    padding: 20px;
    background-color: white;
}

.app__container > h1 {
    font-weight: 500;
    margin-bottom: 20px;
}

.app__container > form > h5 {
    margin-bottom: 5px;
}

.app__container > form > input {
    height: 30px;
    margin-bottom: 10px;
    background-color: white;
    width: 98%;
}

.app__container > p {
    margin-top: 15px;
    font-size: 12px;
}

.app_singInButton {
    background: #222;
    border-radius: 2px;
    width: 100%;
    height: 30px;
    color: white;
    margin-top: 10px;
}

.app_registerButton {
    border-radius: 2px;
    width: 100%;
    height: 30px;
    border: 1px solid;
    margin-top: 10px;
    border-color: darkgray;
}
```

**You are good to go!**

Run the app and try creating an account. In fact try all the use cases and see how they are handled. In case any condition is not satisfied you will see an alert on the top of the window with the specific error.

Now, lets just verify whether the authentication is really working and the users are being registered or not.

Lets go back to the firebase console and go to the **Authentication** menu followed by **Users** tab.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1631685746449/Lp_4Lg99N.png)

If you have seen the app preview at the start of this post I had created an account using **test@gmail.com**, which is visible in the records here. Similarly, you will get to see all the registered users in this tab.

*NOTE: Since we have used the **email/password** sign in method to authenticate the user. We can only access the user's email. In order to access other individual details like name, profile picture you can use other signin methods like google sign in, facebook sign in or else ask these details in the sign in form and store in the database.*

# 5. Conclusion

Congratulations! You did it! 🚀

We now have a ReactJS+Firebase authentication flow set up. 
What next? You can try adding other sign-in methods (for eg - google sign in, facebook sign in) by referring to the [firebase documentation](https://firebase.google.com/docs/auth).

That's it for this post. I hope the tutorial was clear enough to help you. See you in the next one!