// eslint-disable-next-line import/no-extraneous-dependencies
import BabelCore, { PluginObj } from '@babel/core';
import { ObjectProperty } from '@babel/types';

const newReactToken = ['_jsxs', '_jsx'];
export default function ({ types }: typeof BabelCore): PluginObj {
  const {
    isStringLiteral,
    isIdentifier,
    isObjectExpression,
    isMemberExpression,
    isProperty,
    isArrayExpression,
  } = types;
  return {
    name: 'babel-plugin-conflict',
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        // 新版react17.0 不再使用react.createElement 会被编译成jsxs
        if (isIdentifier(callee) && newReactToken.includes(callee.name)) {
          const [, props] = path.node.arguments;
          if (isObjectExpression(props)) {
            // 遍历属性查找children的节点属性
            const childrenProperties = props.properties.find((property) => {
              if (isProperty(property) && isIdentifier(property.key)) {
                return property.key.name === 'children';
              }
              return false;
            }) as ObjectProperty | undefined;
            if (!childrenProperties) {
              return;
            }

            // 如果统一弄成数组进行处理
            const formatChildren = isArrayExpression(childrenProperties.value)
              ? childrenProperties.value.elements
              : [childrenProperties.value];

            const stringLiteralChildArray: string[] = formatChildren
              // @ts-ignore
              .filter((children: any) => isStringLiteral(children))
              .map((child: any) => child.value);
            if (stringLiteralChildArray.some((strText) => strText.match(/(={7})|(>{7})|(<{7})/))) {
              // 检测到合并冲突 直接抛出错误
              throw path.buildCodeFrameError('检测到疑似合并冲突，请处理完之后重新提交');
            }
          }
        }

        // 旧版react
        if (
          !(
            isMemberExpression(callee) &&
            isIdentifier(callee.object) &&
            callee.object.name === 'React' &&
            isIdentifier(callee.property) &&
            callee.property.name === 'createElement'
          )
        ) {
          return;
        }
        // get the component type name and it's extra props options
        const [, , ...childrenArray] = path.node.arguments;
        const stringLiteralChildArray: string[] = childrenArray
          .filter((children) => types.isStringLiteral(children))
          // @ts-ignore
          .map((child) => child.value);
        if (stringLiteralChildArray.some((strText) => strText.match(/(={7})|(>{7})|(<{7})/))) {
          // 检测到合并冲突 直接抛出错误
          throw path.buildCodeFrameError('检测到疑似合并冲突，请处理完之后重新提交');
        }
      },
    },
  };
}
