---
title: "Ways to clone an object in Javascript"
summary: "Diving deeper into the concept of object cloning and exploring different ways and their limitations"
date: "May 14, 2022"
draft: false
tags:
  - Tutorial
  - JavaScript
---

> There are many blog posts, articles, and stack overflow threads that exist on this topic already. This article is my attempt to put the collective knowledge of the internet into one composed summary that is easy to follow and reference.

# What is object cloning and why do we need it?

As the name suggests it simply means "cloning" the properties of an object so that we get a complete copy that is unique but has the same properties as the original object.

There are two common reasons why we need object cloning:

1. Copying data so you can modify the object without affecting the original object.
2. Working with frameworks and libraries that rely on the immutability principle like React, Redux, etc.

# Types of copies

As we know that object is a non-primitive data type, depending on the how you make a copy of an object there are two possibilities:

### 1. Shallow copy

<div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <img 
    src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652512029527/i3bcVuxzO.png" 
    alt="Diagram showing shallow copy concept"
    style="width: 100%; height: auto;"
  />
</div>

The diagram above clearly explains that when a shallow copy of an object is made the new variable still points to the same reference (memory address). Any changes made in the cloned object would change the original object as well.

When an object is copied by reference i.e. only the memory address of the object is copied then it is called a shallow copy.

### 2. Deep copy

<div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <img 
    src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652512233265/Ct6HEKbJJ.png" 
    alt="Diagram showing deep copy concept"
    style="width: 100%; height: auto;"
  />
</div>

Unlike the diagram of shallow copy, here we can see that the variable storing the cloned object points to a new reference (memory address). Any changes made to the cloned object won't affect the original object.

When an object is copied by value i.e. a new memory address is allocated to the cloned object while the values remain the same, then it is called deep copy.

# Ways to clone an object

Let's see the different ways we can clone an object and the limitations of the same one by one with examples.

### 1. assignment operator '='

```javascript
let user = {
    firstName: 'Varun',
    lastName: 'Khalate'
};
let clonedUser = user;

clonedUser.firstName = 'Raj';
console.log(user);
```

Output:
```javascript
{
    firstName: 'Raj',
    lastName: 'Khalate'
}
```

As we can observe, the details of the original object `user` have changed which implies that `clonedUser` is a ***shallow copy***. This doesn't satisfy our first reason listed in why do we need object cloning which is a limitation.

> Javascript does a shallow copy by default for the non-primitive data type.

### 2. for loop

**Example 1**

```javascript
let user = {
    firstName: 'Varun',
    lastName: 'Khalate'
};
let clonedUser = {};

for (let key in user) {
  clonedUser[key] = user[key];
}

clonedUser.firstName = 'Raj';
console.log(user);
```

Output:
```javascript
{
    firstName: 'Varun',
    lastName: 'Khalate'
}
```

As we can observe, the details of the original object `user` did not change which implies that `clonedUser` is a ***deep copy***.

We can use this method to clone an object but what if we have a nested object? Let's take an example.

**Example 2**

```javascript
let user = {
  id: '42',
  name: {
    firstName: 'Varun',
    lastName: 'Khalate'
  }
};
let clonedUser = {};

for (let key in user) {
  clonedUser[key] = user[key];
}

clonedUser.name.firstName = "Raj";
console.log(user);
```

Output:
```javascript
{
    id: '42',
    name: {
       firstName: 'Raj',
       lastName: 'Khalate'
     }
}
```

We can see that the `firstname` has changed to `Raj` which implies that the `name` object inside the `user` object is copied by reference (a shallow copy) in `clonedUser`. Hence we can't say that `clonedUser` is a deep copy.

### 3. Object.assign()

> The Object.assign() method is used to copy the values of all enumerable own properties from one or more source objects to a target object. Objects are assigned and copied by reference. It will return the target object.

Syntax:
```javascript
const clonedUser = Object.assign({}, user);
```

This method is also used to merge objects. You can read more about it [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

Just like for loop this method successfully deep clones an object which has properties that are primitive(string, number, bigint, boolean, symbol, null and undefined) but fails when an object has non-primitive properties (objects, arrays, functions).

### 4. spread operator

Syntax:
```javascript
const cloneUser = { ...user };
```

Similar to Object.assign() this method can be used to clone objects with primitive values but cannot be used to clone nested objects.

### 5. JSON.parse(JSON.stringify())

Let's consider the same example of a nested object again and try this method.

```javascript
let user = {
  id: "42",
  name: {
    firstName: "Varun",
    lastName: "Khalate"
  }
};

let clonedUser = JSON.parse(JSON.stringify(user));

clonedUser.name.firstName = "Raj";
console.log(user);
```

Output:
```javascript
{
    id: "42",
    name: {
       firstName: 'Varun',
       lastName: 'Khalate'
     }
}
```

Finally, this method successfully deep clones a nested object, unlike other methods we discussed above.

Still, it has its own limitations as mentioned below:
* It does not clone functions (everything must serialize to a JSON data type)
* It does not work with the Date type. JSON.stringify(new Date()) returns a string representation of the date in ISO format, which JSON.parse() doesn't convert back to a Date object.

### 6. structuredClone()

Structured cloning addresses many (although not all) shortcomings of the JSON.stringify() technique. Structured cloning can handle cyclical data structures, support many built-in data types, and is generally more robust and often faster.

Syntax:
```javascript
let clonedUser = structuredClone(user)
```

Among other limitations, one of them which structuredClone() could not overcome is that if your object contains functions, they will be quietly discarded. You can read more about the limitation [here](https://web.dev/structured-clone/).

# Summary

| Method | Object with primitive values | Nested objects |
|--------|----------------------------|----------------|
| assignment operator (=) | Shallow clone | Shallow clone |
| for loop | Deep clone | Shallow clone |
| Object.assign() | Deep clone | Shallow clone |
| spread operator (...) | Deep clone | Shallow clone |
| JSON.parse(JSON.stringify()) | Deep clone | Deep clone |
| structuredClone() | Deep clone | Deep clone |

# Conclusion

We started with what and why object cloning is needed followed by knowing the types of copies generated while cloning an object. We also explored some ways to clone an object and saw the limitations of each. There are other methods as well using libraries and other native methods which I haven't included here.

Hope you learned a thing or two while reading this blog post. See you at the next one :)

# References

* [Demystifying copy in Javascript: Deep copy and Shallow copy](https://medium.com/aubergine-solutions/demystifying-copy-in-javascript-deep-copy-and-shallow-copy-ce374c827685)
* [Clone an Object in JavaScript](https://masteringjs.io/tutorials/fundamentals/clone)
* [How to clone a JavaScript object?](https://www.geeksforgeeks.org/how-to-clone-a-javascript-object/)
* [Deep-copying in JavaScript using structuredClone](https://web.dev/structured-clone/)