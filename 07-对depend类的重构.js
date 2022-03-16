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
