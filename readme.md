# API Documentation Generator

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

这是一个工具脚本，用于根据 YAML 文件和特定的 Word 格式生成 API 文档。



## :herb:Installation

`yarn add yaml-api-doc`

或

`npm install yaml-api-doc`



## :herb:Usage

将你的 YAML 文件和 Word 文本放在项目目录下。

引入 `exportWordDoc` 并调用：

```javascript
//test.js
import exportWordDoc from "yaml-api-doc";

exportWordDoc(demoUrl, outUrl, fileName);
//demoUrl: word 模板路径
//outUrl: 输出文档路径
//fileName： yaml 文件路径
//例： exportWordDoc("in.docx", "out.docx", "openapi-resource.yaml");
```

运行 test.js ，生成的 API 文档将会写入到 outUrl 中。



## :herb:YAML File Structure

YAML 文件应遵循特定的结构，以正确生成 API 文档，请参考以下示例：

```yaml
openapi: 3.0.1
info:
  title: TSN系统前后端接口
  version: 0.1.10
servers:
  - url: /
## api描述###################################################
paths:
  /resource/net:
    post:
      tags:
        - net
      summary: 接口名称
      description: 接口描述
      ##输入参数部分，见输入参数
      responses:
        200:
          description: 查询成功
          ##输出参数部分，见输出参数

## 组件数据结构 ###############################################
components:
  schemas:
    # 网络
    basic_net_dto:
      type: object
      properties:
        net_id:
          type: string
          description: 网络ID
          example: "net-1"
        # some other properties
```

#### :pushpin:输入参数格式

```yaml
## requestBody ###############################################
      ## 参数为object
      requestBody:
        description: 参数描述
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/basic_net_dto"
        required: true

      ## 参数为array
      requestBody:
        description: 参数描述
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/basic_net_dto"
        required: true


## parameters #################################################
      parameters:
        - name: 参数名称
          description: 参数描述
          in: path # or query
          required: true
          schema:
            type: 参数类型（string、number……）
```

#### :pushpin:输出参数格式

```yaml
## 输出参数为 array ################################################
          content:
            application/json:
              schema:
                type: array
                description: 参数描述
                items:
                  $ref: "#/components/schemas/basic_link_dto"

## 输出参数为 object ##############################################
          content:
            application/json:
              schema:
                description: 参数描述
                $ref: "#/components/schemas/front_stream_progress_dto"

## 输出参数为 string(此处与number做区分是为了在处理格式时将enum的值作为参数名称)
          content:
            application/json:
              schema:
                type: string
                description: 参数描述
                enum: ["simulation", "reality"]
                example: "simulation"

## 输出参数为 number ##############################################
          content:
            application/json:
              schema:
                description: 参数描述
                type: number
                format: double
                example: 20.0
```



## :herb: OutPut Array Structure

经程序处理后，输出为三个数组（用户不可见），各自的结构如下：

#### :pushpin: apiList（接口列表）

```js
apiList = [
  {
    index: number, //接口编号
    summary: string, //接口名称
    description: string, //接口描述
  },
];
```

#### :pushpin: components（组件列表）

```js
components = [
  {
    index: number, //组件编号
    name: string, //组件名称
    items: [
      {
        index: number, //参数编号
        name: string, //参数名称
        type: string, //参数类型
        example: string, //参数样例
        description: string, //参数描述
      },
    ],
  },
];
```

#### :pushpin: apiDetail （接口详情）

```js
apiDetail = [
  {
    index: number, //接口编号
    summary: string, //接口名称
    description: string, //接口描述
    path: string, //接口路径
    method: string, //接口方法
    params: [
      //输入参数
      {
        name: string, //参数名称
        type: string, //参数类型
        description: string, //参数描述
      },
    ],
    out: [
      //输出参数
      {
        name: string, //参数名称
        type: string, //参数类型
        description: string, //参数描述
      },
    ],
  },
];
```



## :herb:Customization

可以自定义传入 word 模板来控制生成文档的格式，参考文档格式如下（可见项目目录下`in.docx`）：

#### :pushpin: 接口清单

| **编号**          | **名称**  | **描述**                 |
| ----------------- | --------- | ------------------------ |
| {#apiList}{index} | {summary} | {description} {/apiList} |

#### :pushpin: 组件定义

---

{#components}

表 {index} {name}定义

| **序号**        | **参数名称** | **参数类型** | **参数示例** | **参数说明**          |
| --------------- | ------------ | ------------ | ------------ | --------------------- |
| {#items}{index} | {name}       | {type}       | {example}    | {description}{/items} |

{/components}

---



#### :pushpin: 接口详情

---

{#apiDetail}

表 {index} {summary}接口定义

| **接口名称**  | {summary}       |              |                        |
| ------------- | --------------- | ------------ | ---------------------- |
| **HTTP 方法** | {method}        |              |                        |
| **资源路径**  | {path}          |              |                        |
| **功能描述**  | {description}   |              |                        |
| **输入参数**  | **参数名称**    | **参数类型** | **参数描述**           |
|               | {#params}{name} | {type}       | {description}{/params} |
| **输出参数**  | **参数名称**    | **参数类型** | **参数描述**           |
|               | {#out}{name}    | {type}       | {description}{/out}    |

{/apiDetail}

---



#### :pushpin: more

:zap: 使用 `{#api}` 和 `{/api}` 使用 api 数组内部的参数。

:zap: word 格式可个性化定制。



## :herb:Output docx

| **编号** | **名称**         | **描述**                   |
| -------- | ---------------- | -------------------------- |
| 1        | 获取所有网络     | 查询系统中所有网络列表     |
| 2        | 创建一个新的网络 | 提供网络参数，创建新的网络 |
| 3        | 获取指定网络     | 根据网络 id 获取指定的网络 |



| **序号** | **参数名称** | **参数类型** | **参数示例**     | **参数说明** |
| -------- | ------------ | ------------ | ---------------- | ------------ |
| 1        | net_id       | string       | net-1            | 网络 ID      |
| 2        | net_name     | string       | 分布式光伏示范网 | 网络名称     |
| 3        | status       | string       | enabled          | 网络状态     |
| 4        | nodes        | array        | [basic_node_dto] | 节点列表     |
| 5        | links        | array        | [basic_link_dto] | 链路列表     |



| **接口名称**  | 获取所有网络           |              |              |
| :------------ | :--------------------- | ------------ | ------------ |
| **HTTP 方法** | get                    |              |              |
| **资源路径**  | /resource/net          |              |              |
| **功能描述**  | 查询系统中所有网络列表 |              |              |
| **输入参数**  | **参数名称**           | **参数类型** | **参数描述** |
|               |                        |              |              |
| **输出参数**  | **参数名称**           | **参数类型** | **参数描述** |
|               | [basic_net_dto]        | array        | 网络列表     |



## :herb:License

This project is licensed under the [MIT License](LICENSE).
