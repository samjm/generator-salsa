'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
module.exports = class guiService {
  static destinationPath(seccion) {
    return context.destinationComponentPath + seccion.dashCase + '/' + seccion.dashCase + '.vue';
  }
  static resolveJson(context) {
    return JSON.parse(fsreader.readFileSync(context.uiDescFile));
  }
  static resolveSecciones(campos) {
    let secciones = {};
    campos.forEach(campo => {
      let seccion = String.toCamelCase(campo.seccion);
      let subseccion = String.toCamelCase(campo.subseccion);
      if (!secciones[seccion]) {
        secciones[seccion] = this.defaultSeccion(campo.seccion);
        secciones[seccion].props.labelEn = campo.seccionEn;
        secciones[seccion].props.modelParent = campo.modelo.split('.')[0];
      }
      if (!secciones[seccion][subseccion]) {
        secciones[seccion][subseccion] = this.defaultSubseccion(campo.subseccion);
        secciones[seccion][subseccion].props.labelEn = campo.subseccionEn;
      }
      secciones[seccion][subseccion].campos.push(this.formatCampo(campo));
    });
    return secciones;
  }

  static defaultSeccion(description) {
    let seccion = { props: {} };
    seccion.props.label = description;
    seccion.props.pascalCase = String.toPascalCase(description);
    seccion.props.camelCase = String.toCamelCase(description);
    seccion.props.snakeCase = String.toSnakeCase(description);
    seccion.props.dashCase = String.toDashCase(description);
    return seccion;
  }

  static defaultVariables(secciones, seccion) {
    return {
      seccion: secciones[seccion],
      seccionLabel: secciones[seccion].props.label,
      seccionPascalCase: secciones[seccion].props.pascalCase,
      seccionCamelCase: secciones[seccion].props.camelCase,
      seccionSnakeCase: secciones[seccion].props.snakeCase,
      seccionDashCase: secciones[seccion].props.dashCase,
    };
  }

  static defaultSubseccion(description) {
    let subseccion = { props: {} };
    subseccion.props.label = description;
    subseccion.props.pascalCase = String.toPascalCase(description);
    subseccion.props.camelCase = String.toCamelCase(description);
    subseccion.props.snakeCase = String.toSnakeCase(description);
    subseccion.props.dashCase = String.toDashCase(description);
    subseccion.campos = [];
    return subseccion;
  }

  static formatCampo(campo) {
    campo.label = campo.campo;
    campo.labelEn = campo.campoEn;
    campo.camelCase = String.toCamelCase(campo.campo);
    campo.pascalCase = String.toPascalCase(campo.campo);
    campo.lowerCase = String.toCamelCase(campo.campo);
    campo.snakeCase = String.toSnakeCase(campo.campo);
    campo.dashCase = String.toDashCase(campo.campo);
    campo.constantCase = String.toConstantCase(campo.campo);
    campo.clientType = this.resolveClientType(campo.tipoUi);
    campo.clientDefaultValue = this.resolveDefaultValue(campo.tipoUi);
    campo.description = campo.descripcion;
    campo.descriptionEn = campo.descripcionEn;
    campo.validations = this.resolveValidations(campo);
    campo.props = this.resolveProps(campo);
    campo.model = `${campo.modelo}.${campo.nombre}`;
    ///campo.modelThree = this.resolveModelDesc(campo);
    campo.name = campo.nombre;
    return campo;
  }

  //TODO test hasta 3 niveles
  static resolveModelDesc(campo) {
    let three = {};
    let temp = campo.model.split('.');
    three.parent = temp[0];
    if (temp.length <= 2) {
      three.child = {};
      three.child.name = temp[1];
      three.child.validations = {};
      three.child.validations = this.resolveValidations(campo);
    } else {
      three.child = {};
      three.child.child = {};
      three.child.child.name = temp[2];
      three.child.child.validations = {};
      three.child.child.validations = this.resolveValidations(campo);
    }
    return three;
  }

  static resolveClientType(tipoUi) {
    if (tipoUi === 'Date') {
      return 'Date';
    }

    if (tipoUi === 'Text' || tipoUi === 'TextArea' || tipoUi === 'ListBox') {
      return 'string';
    }

    if (tipoUi === 'Number') {
      return 'number';
    }

    if (tipoUi === 'ListBox') {
      return 'string';
    }

    if (tipoUi === 'MultiSelect' || tipoUi === 'selectMultiple') {
      return '[]';
    }

    if (tipoUi === 'Radio Button' || tipoUi === 'Boolean') {
      return 'boolean';
    }
    return 'string';
  }

  static resolveDefaultValue(tipoUi) {
    if (tipoUi === 'Date') {
      return 'null';
    }

    if (tipoUi === 'Text' || tipoUi === 'TextArea' || tipoUi === 'ListBox') {
      return "''";
    }

    if (tipoUi === 'Number') {
      return 'null';
    }

    if (tipoUi === 'ListBox') {
      return "''";
    }

    if (tipoUi === 'MultiSelect' || tipoUi === 'selectMultiple') {
      return '[]';
    }

    if (tipoUi === 'Radio Button' || tipoUi === 'Boolean') {
      return 'false';
    }
    return "''";
  }

  static resolveValidations(campo) {
    const validations = {};
    validations.required = campo.requerido;
    validations.requiredValue = campo.requerido;
    if (campo.min) {
      validations.min = campo.min;
    }
    if (campo.max) {
      validations.max = campo.max;
    }
    if (campo.regex) {
      validations.regex = campo.regex;
    }
    return validations;
  }

  static resolveProps(campo) {
    const props = {};
    if (campo.tipoUi === 'TextArea') {
      props.maxCaracteres = campo.maxCaracteres;
    }
    if (campo.tipoUi === 'Date') {
      props.minDate = campo.minDate;
      props.maxDate = campo.maxDate;
    }
    if (campo.tipoUi === 'MultiSelect' || campo.tipoUi === 'selectMultiple') {
      props.minimosRequeridos = campo.minimosRequeridos ? campo.minimosRequeridos : 1;
    }
    return props;
  }
};
