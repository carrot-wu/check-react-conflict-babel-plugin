# check-conflict-babel-plugin
[![NPM Version][npm-image]][npm-url]

一个能够检测react渲染函数中(render)是否有合并冲突遗留代码的babel插件

## 安装

```
npm install @carrotwu/check-conflict-babel-plugin -D
or
yarn add @carrotwu/check-conflict-babel-plugin -D
```

## 使用

使用的方式十分简单，只需要在babel配置中的babel插件配置中引入当前插件即可。

### cra中使用

> 下面展示在create-react-app中如何使用当前插件

因为create-react-app需要自定义配置的话有两种方式：
1. 通过eject的方式把配置暴露出来
2. 通过社区的`customize-cra`库进行配置覆盖

这里仅仅展示第二种方式的插件安装,`customize-cra`的具体安装方式可以查看具体的官网即可。


`config-overrides.js`相关配置如下:

```js
const { override, addBabelPlugins } = require('customize-cra');
const checkReactConflictBabelPlugin = require('@carrotwu/check-conflict-babel-plugin')

const isProduction = process.env.NODE_ENV === 'production'
module.exports = {
  webpack: override(
    // 生产模式才启用当前插件
    isProduction && addBabelPlugins(checkReactConflictBabelPlugin)
  )
};

```

## 插件是如何检测冲突代码的呢

我们都知道的是在react中，所有的jsx代码最终都会被react转移成`react.createElement`的代码形式，所以我们只需要通过babel对生成的语法树做语法分析即可。这样子我们就能获取到渲染函数中的合并冲突代码。如果想更加深入的了解插件的内在原理，可以查看我之前写的一篇[`博客文章`](https://github.com/timarney/react-app-rewired/)