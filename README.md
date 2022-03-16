# 响应式

## 对象的响应式

```javascript
//在实际开发中基本上都是对于对象的响应式

const info = {
  name: "jay",
  age: 18,
};

//这里下面是我想要做到的(当name发生改变的时候)
console.log(1231);
console.log(info.name);
function hello(name) {
  console.log(`你好啊${name}`);
}

info.name = "james";

```



## 封装响应式函数

```javascript
//在实际开发中基本上都是对于对象的响应式

//定义一个存储响应式的函数的数组
const reactiveFns = [];

//定义一个函数，参数为需要执行的响应式的函数
function watchFn(Fn) {
  reactiveFns.push(Fn);
}

const info = {
  name: "jay",
  age: 18,
};

//这里下面是我想要做到的(当name发生改变的时候)
//比如这个函数是我需要响应式调用的
function foo() {
  console.log(1231);
  console.log(info.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(info.name);
}

//我把这个需要产生响应式的函数直接给他传进去
watchFn(foo);

//或者我还有一个需要产生响应式的函数
watchFn(function demo() {
  console.log("无敌是多么的寂寞~~~~", info.name);
});

//下面这个函数不是我需要响应式调用的
function baz() {
  console.log("再见了我的爱");
}

//当属性发生修改后，想要使得与这个属性相关的函数再执行一遍
info.name = "james";
reactiveFns.forEach((fn) => fn());

```



## 依赖收集类的封装

```javascript
//在实际开发中基本上都是对于对象的响应式

//定义一个存储响应式的函数的数组
// const reactiveFns = []; //这里是依赖于name的响应式函数的存放所在地

//但是很明显不合适，如果每个属性的相关响应式函数都放在相应的数组中，则需要定义好多好多数组

//所以最好搞一个类来封装
class Depend {
  constructor() {
    this.reactiveFns = [];
  }

  addDepend(reactiveFn) {
    this.reactiveFns.push(reactiveFn);
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

//定义一个函数，参数为需要执行的响应式的函数

const depend = new Depend();
function watchFn(Fn) {
  // reactiveFns.addDepend(Fn);
  depend.addDepend(Fn);
}

const info = {
  name: "jay", //对应一个depend对象
  age: 18, //对应一个depend对象
};

//这里下面是我想要做到的(当name发生改变的时候)
//比如这个函数是我需要响应式调用的
function foo() {
  console.log(1231);
  console.log(info.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(info.name);
}

//我把这个需要产生响应式的函数直接给他传进去
watchFn(foo);

//或者我还有一个需要产生响应式的函数
watchFn(function () {
  console.log("无敌是多么的寂寞~~~~", info.name);
});

//下面这个函数不是我需要响应式调用的
function baz() {
  console.log("再见了我的爱");
}

//当属性发生修改后，想要使得与这个属性相关的函数再执行一遍
info.name = "james";
// reactiveFns.forEach((fn) => fn());
depend.notify();

```



## 自动监听对象的变化

```javascript
class Depend {
  constructor() {
    this.reactiveFns = [];
  }

  addDepend(reactiveFn) {
    this.reactiveFns.push(reactiveFn);
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

const depend = new Depend();
function watchFn(Fn) {
  depend.addDepend(Fn);
}

const info = {
  name: "jay", //对应一个depend对象,这里其实还没这样做
  age: 18, //对应一个depend对象，这里其实还没这样做
};

//监听对象的属性变化（proxy：vue3，Object.defineProperty:vue2）
const infoProxy = new Proxy(info, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },
  set(target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver);
    depend.notify(); //这里会对属性设置变化做出监听，所以直接在这里notify即可
  },
});

//这里下面是我想要做到的(当name发生改变的时候)
//比如这个函数是我需要响应式调用的
function foo() {
  console.log(1231);
  console.log(infoProxy.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(infoProxy.name);
}

//我把这个需要产生响应式的函数直接给他传进去
watchFn(foo);

//或者我还有一个需要产生响应式的函数
watchFn(function () {
  console.log("无敌是多么的寂寞~~~~", infoProxy.name);
});

//当属性发生修改后，想要使得与这个属性相关的函数再执行一遍
infoProxy.name = "james";
// reactiveFns.forEach((fn) => fn());
// depend.notify(); 需要做到自动监听响应式 自动监听对象的属性变化

infoProxy.name = "kobe";

infoProxy.name = "eason";

```



## 依赖收集的管理

![image-20220207195646127](响应式.assets/image-20220207195646127.png)

```javascript
class Depend {
  constructor() {
    this.reactiveFns = [];
  }

  addDepend(reactiveFn) {
    this.reactiveFns.push(reactiveFn);
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

// const depend = new Depend();之前一直用的是这一个depend对象，一个depend对象只能收集一个对象对应的一个属性的相关依赖
//需要收集多个属性的依赖则需要创建多个depend
// function watchFn(Fn) {
//   depend.addDepend(Fn);
// }

const info = {
  name: "jay", //对应一个depend对象
  age: 18, //对应一个depend对象
};

//封装一个获取depend的函数
const targetMap = new WeakMap();
function getDepend(target, key) {
  //根据target对象获取map的过程
  let map = targetMap.get(target);
  if (!map) {
    //第一次map还没有初始化
    map = new Map();
    targetMap.set(target, map);
  }

  //根据key获取depend对象
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

//监听对象的属性变化（proxy：vue3，Object.defineProperty:vue2）
const infoProxy = new Proxy(info, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },
  set(target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver);
    // depend.notify(); //这里会对属性设置变化做出监听，所以直接在这里notify即可
    //这里没有对depend做区分 肯定是不行的 所以要定义一个能够获取到depend的方法
    const depend = getDepend(target, key);
    console.log(depend.reactiveFns);
    depend.notify();
  },
});

//这里下面是我想要做到的(当name发生改变的时候)
//比如这个函数是我需要响应式调用的
function foo() {
  console.log(infoProxy.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(infoProxy.name);
}

//我把这个需要产生响应式的函数直接给他传进去
// watchFn(foo);

//当属性发生修改后，想要使得与这个属性相关的函数再执行一遍
infoProxy.name = "james";
infoProxy.name = "kobe";
infoProxy.name = "eason";

//info对象
//name -depend
//age -depend

```

总结：在这里还没有收集依赖，仅仅只是列出了大体思路，但是可以看到的是，在修改了相关属性后，的却是先找到了相关属性对应的依赖，所以在这里打印依赖里面收集的函数列表的时候会出现三个空数组（此时还没有收集依赖，但是修改了属性三次），可见初步的设想是成功的。





## 正确的收集依赖

![image-20220207222937244](响应式.assets/image-20220207222937244.png)



```javascript
class Depend {
  constructor() {
    this.reactiveFns = [];
  }

  addDepend(reactiveFn) {
    this.reactiveFns.push(reactiveFn);
    console.log(this.reactiveFns);
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

// const depend = new Depend();之前一直用的是这一个depend对象，一个depend对象只能收集一个对象对应的一个属性的相关依赖
//需要收集多个属性的依赖则需要创建多个depend

let currentReactiveFn = null;
function watchFn(Fn) {
  currentReactiveFn = Fn;
  Fn(); //传进来之后先自己运行一次，为了收集依赖
  currentReactiveFn = null;
}

const info = {
  name: "jay", //对应一个depend对象
  age: 18, //对应一个depend对象
};

//封装一个获取depend的函数
const targetMap = new WeakMap();
function getDepend(target, key) {
  //根据target对象获取map的过程
  let map = targetMap.get(target);
  if (!map) {
    //第一次map还没有初始化
    map = new Map();
    targetMap.set(target, map);
  }

  //根据key获取depend对象
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

//监听对象的属性变化（proxy：vue3，Object.defineProperty:vue2）
const infoProxy = new Proxy(info, {
  get(target, key, receiver) {
    //当响应式函数对属性有依赖的时候，比如拿到了相应的属性，则一定会出发这个get方法
    //则在这里收集依赖即可，收集依赖肯定需要拿到当前依赖的depend
    //1.拿到当前依赖的depend，这里是很容易实现的
    const depend = getDepend(target, key);

    //2.第二步就需要一点技巧了，拿到depend怎么添加这个响应式函数呢
    //可以在外部定义一个全局变量，记录当前运行的函数，一般在收集依赖之前，先会调用一次函数
    //在调用函数之前，将全局变量复制为这个函数，调用完毕之后清空即可。
    if (currentReactiveFn) {
      //这里必须加这个判断，因为再次调用被依赖的方法的时候肯定会来到get这里
      //此时依赖在最开始的第一轮已经收集结束，收集结束后currentReactiveFn肯定是null
      //如果不在这里添加判断条件的话，又会收集一遍依赖,添加null进入当前depend的依赖函数数组中
      //最后会报错
      depend.addDepend(currentReactiveFn);
    }

    return Reflect.get(target, key, receiver);
  },
  set(target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver);
    // depend.notify(); //这里会对属性设置变化做出监听，所以直接在这里notify即可
    //这里没有对depend做区分 肯定是不行的 所以要定义一个能够获取到depend的方法
    const depend = getDepend(target, key);
    depend.notify();
  },
});

//这里下面是我想要做到的(当name发生改变的时候)
//比如这个函数是我需要响应式调用的
function foo() {
  console.log("-----------name相关的函数开始-----------");
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(infoProxy.name);
  console.log("------------name相关的函数结束-----------\n");
}

//我把这个需要产生响应式的函数直接给他传进去
watchFn(foo);

watchFn(function () {
  console.log("------------age相关的函数开始-----------");
  console.log(infoProxy.age);
  console.log("------------age相关的函数结束-----------\n");
});

watchFn(function () {
  console.log("------------name和age相关的函数开始-----------");
  console.log(infoProxy.name);
  console.log(infoProxy.age);
  console.log("------------name和age相关的函数结束-----------");
});

//当属性发生修改后，想要使得与这个属性相关的函数再执行一遍
console.log("---------------修改完name之后------------");
infoProxy.name = "james";
console.log("---------------修改完age之后------------");
infoProxy.age = 19;

// infoProxy.name = "kobe";

```

总结：怎么正确收集依赖呢？首先需要想到，在哪里收集依赖，参考上图中以下代码片段及其注释

```javascript
//监听对象的属性变化（proxy：vue3，Object.defineProperty:vue2）
const infoProxy = new Proxy(info, {
  get(target, key, receiver) {
    //当响应式函数对属性有依赖的时候，比如拿到了相应的属性，则一定会出发这个get方法
    //则在这里收集依赖即可，收集依赖肯定需要拿到当前依赖的depend
    //1.拿到当前依赖的depend，这里是很容易实现的
    const depend = getDepend(target, key);

    //2.第二步就需要一点技巧了，拿到depend怎么添加这个响应式函数呢
    //可以在外部定义一个全局变量，记录当前运行的函数，一般在收集依赖之前，先会调用一次函数
    //在调用函数之前，将全局变量复制为这个函数，调用完毕之后清空即可。
    if (currentReactiveFn) {
      //这里必须加这个判断，因为再次调用被依赖的方法的时候肯定会来到get这里
      //此时依赖在最开始的第一轮已经收集结束，收集结束后currentReactiveFn肯定是null
      //如果不在这里添加判断条件的话，又会收集一遍依赖,添加null进入当前depend的依赖函数数组中
      //最后会报错
      depend.addDepend(currentReactiveFn);
    }

    return Reflect.get(target, key, receiver);
  },
  set(target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver);
    // depend.notify(); //这里会对属性设置变化做出监听，所以直接在这里notify即可
    //这里没有对depend做区分 肯定是不行的 所以要定义一个能够获取到depend的方法
    const depend = getDepend(target, key);
    depend.notify();
  },
});

```



```javascript
let currentReactiveFn = null;
function watchFn(Fn) {
  currentReactiveFn = Fn;
  Fn(); //传进来之后先自己运行一次，为了收集依赖
  currentReactiveFn = null;
}
```



## 对Depend类进行重构

```javascript
let currentReactiveFn = null;

class Depend {
  constructor() {
    //*这里将数组换成set，因为后续的响应式函数里如果多次引用了变量的话，那么这个响应式函数就只添加一次就好，没有必要添加多次
    this.reactiveFns = new Set();
  }

  addDepend(reactiveFn) {
    this.reactiveFns.add(reactiveFn);
    // console.log(this.reactiveFns);
  }

  depend() {
    //收集依赖
    if (currentReactiveFn) {
      this.addDepend(currentReactiveFn);
    }
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

// const depend = new Depend();之前一直用的是这一个depend对象，一个depend对象只能收集一个对象对应的一个属性的相关依赖
//需要收集多个属性的依赖则需要创建多个depend

function watchFn(Fn) {
  currentReactiveFn = Fn;
  Fn(); //传进来之后先自己运行一次，为了收集依赖
  currentReactiveFn = null;
}

const info = {
  name: "jay", //对应一个depend对象
  age: 18, //对应一个depend对象
};

//封装一个获取depend的函数
const targetMap = new WeakMap();
function getDepend(target, key) {
  //根据target对象获取map的过程
  let map = targetMap.get(target);
  if (!map) {
    //第一次map还没有初始化
    map = new Map();
    targetMap.set(target, map);
  }

  //根据key获取depend对象
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

//监听对象的属性变化（proxy：vue3，Object.defineProperty:vue2）
const infoProxy = new Proxy(info, {
  get(target, key, receiver) {
    //当响应式函数对属性有依赖的时候，比如拿到了相应的属性，则一定会出发这个get方法
    //则在这里收集依赖即可，收集依赖肯定需要拿到当前依赖的depend
    //1.拿到当前依赖的depend，这里是很容易实现的
    const depend = getDepend(target, key);

    //2.第二步就需要一点技巧了，拿到depend怎么添加这个响应式函数呢
    //可以在外部定义一个全局变量，记录当前运行的函数，一般在收集依赖之前，先会调用一次函数
    //在调用函数之前，将全局变量复制为这个函数，调用完毕之后清空即可。
    // if (currentReactiveFn) {
    //这里必须加这个判断，因为再次调用被依赖的方法的时候肯定会来到get这里
    //此时依赖在最开始的第一轮已经收集结束，收集结束后currentReactiveFn肯定是null
    //如果不在这里添加判断条件的话，又会收集一遍依赖,添加null进入当前depend的依赖函数数组中
    //最后会报错
    //   depend.addDepend(currentReactiveFn);
    // }

    //*这里可以进行优化，在depend类中新增depend方法，从而不用在proxy中关心当前活跃的函数
    depend.depend();

    return Reflect.get(target, key, receiver);
  },
  set(target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver);
    // depend.notify(); //这里会对属性设置变化做出监听，所以直接在这里notify即可
    //这里没有对depend做区分 肯定是不行的 所以要定义一个能够获取到depend的方法
    const depend = getDepend(target, key);
    depend.notify();
  },
});

watchFn(() => {
  console.log(infoProxy.name, "--------");
  console.log(infoProxy.name, "++++++++");
});

infoProxy.name = "kobe";

```

总结：优化了两个地方：1.添加了depend方法，在proxy中set捕获的时候可以不关心当前活跃的函数，直接将添加依赖封装到具体的方法实现；2.使用Set代替Depend中的数组，防止多次响应重复的函数。



## 对象的响应式操作（vue3）

```javascript
let currentReactiveFn = null;

class Depend {
  constructor() {
    this.reactiveFns = new Set();
  }

  addDepend(reactiveFn) {
    this.reactiveFns.add(reactiveFn);
    // console.log(this.reactiveFns);
  }

  depend() {
    //收集依赖
    if (currentReactiveFn) {
      this.addDepend(currentReactiveFn);
    }
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

// const depend = new Depend();之前一直用的是这一个depend对象，一个depend对象只能收集一个对象对应的一个属性的相关依赖
//需要收集多个属性的依赖则需要创建多个depend

function watchFn(Fn) {
  currentReactiveFn = Fn;
  Fn(); //传进来之后先自己运行一次，为了收集依赖
  currentReactiveFn = null;
}

//封装一个获取depend的函数
const targetMap = new WeakMap();
function getDepend(target, key) {
  //根据target对象获取map的过程
  let map = targetMap.get(target);
  if (!map) {
    //第一次map还没有初始化
    map = new Map();
    targetMap.set(target, map);
  }

  //根据key获取depend对象
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const depend = getDepend(target, key);
      //*这里可以进行优化，在depend类中新增depend方法，从而不用在proxy中关心当前活跃的函数
      depend.depend();

      return Reflect.get(target, key, receiver);
    },
    set(target, key, newValue, receiver) {
      Reflect.set(target, key, newValue, receiver);
      // depend.notify(); //这里会对属性设置变化做出监听，所以直接在这里notify即可
      //这里没有对depend做区分 肯定是不行的 所以要定义一个能够获取到depend的方法
      const depend = getDepend(target, key);
      depend.notify();
    },
  });
}

// const info = {
//   name: "jay", //对应一个depend对象
//   age: 18, //对应一个depend对象
// };

// const infoProxy = reactive(info); //此时infoProxy已经是响应式对象了

// watchFn(() => {
//   console.log(infoProxy.name);
// });

// watchFn(() => {
//   console.log(infoProxy.age);
// });

// infoProxy.name = "kobe";

//当然最好这么搞
const obj = reactive({
  name: "james",
  height: 1.88,
});
//这个obj其实已经是响应式对象了

// 那么可以直接这样搞
watchFn(() => {
  console.log(obj.name, "!!!!!!!!!!");
});
obj.name = "eason";

```

**总结：封装了一个响应式函数，将传入的对象修改为响应式对象，实际上就是在里面返回该对象对应的proxy对象。**



##对象的响应式操作（vue2）

```javascript
let currentReactiveFn = null;

class Depend {
  constructor() {
    this.reactiveFns = new Set();
  }

  addDepend(reactiveFn) {
    this.reactiveFns.add(reactiveFn);
    // console.log(this.reactiveFns);
  }

  depend() {
    //收集依赖
    if (currentReactiveFn) {
      this.addDepend(currentReactiveFn);
    }
  }

  notify() {
    this.reactiveFns.forEach((fn) => fn());
  }
}

// const depend = new Depend();之前一直用的是这一个depend对象，一个depend对象只能收集一个对象对应的一个属性的相关依赖
//需要收集多个属性的依赖则需要创建多个depend

function watchFn(Fn) {
  currentReactiveFn = Fn;
  Fn(); //传进来之后先自己运行一次，为了收集依赖
  currentReactiveFn = null;
}

//封装一个获取depend的函数
const targetMap = new WeakMap();
function getDepend(target, key) {
  //根据target对象获取map的过程
  let map = targetMap.get(target);
  if (!map) {
    //第一次map还没有初始化
    map = new Map();
    targetMap.set(target, map);
  }

  //根据key获取depend对象
  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

function reactive(obj) {
  Object.keys(obj).forEach((key) => {
    let value = obj[key];

    Object.defineProperty(obj, key, {
      get() {
        //收集依赖
        const depend = getDepend(obj, key);
        depend.depend();
        return value;
      },
      set(newValue) {
        const depend = getDepend(obj, key);
        value = newValue;
        depend.notify();
      },
    });
  });

  return obj;
}

// const info = {
//   name: "jay", //对应一个depend对象
//   age: 18, //对应一个depend对象
// };

// const infoProxy = reactive(info); //此时infoProxy已经是响应式对象了

// watchFn(() => {
//   console.log(infoProxy.name);
// });

// watchFn(() => {
//   console.log(infoProxy.age);
// });

// infoProxy.name = "kobe";

//当然最好这么搞
const obj = reactive({
  name: "james",
  height: 1.88,
});
//这个obj其实已经是响应式对象了

// 那么可以直接这样搞
watchFn(() => {
  console.log(obj.name, "!!!!!!!!!!");
});
obj.name = "eason";

console.log(obj);

```

总结：其实就是reactive函数的实现不同，vue2是利用defineProperty中修改每个对象的属性为存取属性描述符，利用其get和set来劫持中间操作，与proxy类似，但是会修改本身的对象属性。

