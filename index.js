import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import yaml from "yaml";
import path from "path";
import fs from "fs";

//接口列表
const getApiList = (yamlFile) => {
  let apiList = [];
  for (let path in yamlFile.paths) {
    for (let method in yamlFile.paths[path]) {
      let temp = yamlFile.paths[path][method];
      apiList.push({
        index: apiList.length + 1,
        summary: temp.summary,
        description: temp.description,
      });
    }
  }
  return apiList;
};

//组件列表
const getComponents = (yamlFile) => {
  let components = [];
  for (let component in yamlFile.components.schemas) {
    let singleComponent = [];
    for (let param in yamlFile.components.schemas[component].properties) {
      let temp = yamlFile.components.schemas[component].properties[param];
      singleComponent.push({
        index: singleComponent.length + 1,
        name: param,
        type: temp.type,
        example: temp.example,
        description: temp.description,
      });
    }
    components.push({
      index: components.length + 1,
      name: component,
      items: singleComponent,
    });
  }
  return components;
};

//接口详情
const getApiDetail = (yamlFile) => {
  let apiDetail = [];
  for (let path in yamlFile.paths) {
    for (let method in yamlFile.paths[path]) {
      let params = []; //输入参数
      let out = []; //输出参数
      if (yamlFile.paths[path][method].requestBody) {
        let schema =
          yamlFile.paths[path][method].requestBody.content["application/json"]
            .schema;
        let name =
          schema.type === "array"
            ? `[${schema.items["$ref"].split("/").slice(-1)}]`
            : schema["$ref"].split("/").slice(-1);

        params.push({
          name: name,
          type: schema.type ?? "object",
          description: yamlFile.paths[path][method].requestBody.description,
        });
      }

      if (yamlFile.paths[path][method].parameters) {
        for (let item in yamlFile.paths[path][method].parameters) {
          let temp = yamlFile.paths[path][method].parameters[item];
          params.push({
            name: temp.name,
            type: temp.schema.type ?? "",
            description: temp.description ?? "",
          });
        }
      }

      if (yamlFile.paths[path][method].responses[200]?.content) {
        let schema =
          yamlFile.paths[path][method].responses[200].content[
            "application/json"
          ].schema;
        out.push({
          name: schema["$ref"]
            ? schema["$ref"].split("/").slice(-1)
            : schema.format
            ? schema.format
            : schema.enum
            ? schema.enum
            : schema.name
            ? schema.name
            : `[${schema.items["$ref"].split("/").slice(-1)}]`,
          type: schema.type ?? "object",
          description: schema.description ?? "",
        });
      }

      if (!params.length) params.push({ name: "", type: "", description: "" });
      if (!out.length) out.push({ name: "", type: "", description: "" });

      apiDetail.push({
        index: apiDetail.length + 1,
        summary: yamlFile.paths[path][method].summary,
        description: yamlFile.paths[path][method].description,
        path: path,
        method: method,
        params: params,
        out: out,
      });
    }
  }
  return apiDetail;
};

export default exportWordDoc = (demoUrl, outUrl, fileName) => {
  //读
  const file = fs.readFileSync(path.join(__dirname, `./${fileName}`), "utf8");
  const yamlFile = yaml.parse(file);

  const content = fs.readFileSync(
    path.resolve(__dirname, `./${demoUrl}`),
    "binary"
  );
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const apiList = getApiList(yamlFile);
  const components = getComponents(yamlFile);
  const apiDetail = getApiDetail(yamlFile);

  //写
  doc.setData({ apiList, components, apiDetail });
  doc.render();

  //生成
  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  fs.writeFileSync(path.resolve(__dirname, `./${outUrl}`), buf);
};

// exportWordDoc("in.docx", "out.docx", "openapi-resource.yaml");
