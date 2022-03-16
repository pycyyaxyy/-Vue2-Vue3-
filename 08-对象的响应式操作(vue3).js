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

console.log(obj);
