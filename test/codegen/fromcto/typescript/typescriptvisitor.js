/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const chai = require('chai');
chai.should();
const sinon = require('sinon');

const TypescriptVisitor = require('../../../../lib/codegen/fromcto/typescript/typescriptvisitor.js');
const { MapDeclaration, MapKeyType, ModelUtil, ScalarDeclaration } = require('@accordproject/concerto-core');

const ClassDeclaration = require('@accordproject/concerto-core').ClassDeclaration;
const EnumDeclaration = require('@accordproject/concerto-core').EnumDeclaration;
const EnumValueDeclaration = require('@accordproject/concerto-core').EnumValueDeclaration;
const Field = require('@accordproject/concerto-core').Field;
const ModelFile = require('@accordproject/concerto-core').ModelFile;
const ModelManager = require('@accordproject/concerto-core').ModelManager;
const RelationshipDeclaration = require('@accordproject/concerto-core').RelationshipDeclaration;
const FileWriter = require('@accordproject/concerto-util').FileWriter;
let sandbox = sinon.createSandbox();

describe('TypescriptVisitor', function () {
    let typescriptVisitor;
    let mockFileWriter;
    beforeEach(() => {
        typescriptVisitor = new TypescriptVisitor();
        mockFileWriter = sinon.createStubInstance(FileWriter);
    });

    describe('visit', () => {
        let param;
        beforeEach(() => {
            param = {
                property1: 'value1'
            };
        });

        it('should return visitModelManager for a ModelManager', () => {
            let thing = sinon.createStubInstance(ModelManager);
            thing.isModelManager.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitModelManager');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitModelFile for a ModelFile', () => {
            let thing = sinon.createStubInstance(ModelFile);
            thing.isModelFile.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitModelFile');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitEnumDeclaration for a EnumDeclaration', () => {
            let thing = sinon.createStubInstance(EnumDeclaration);
            thing.isEnum.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitEnumDeclaration');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitClassDeclaration for a ClassDeclaration', () => {
            let thing = sinon.createStubInstance(ClassDeclaration);
            thing.isClassDeclaration.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitClassDeclaration');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitField for a Field', () => {
            let thing = sinon.createStubInstance(Field);
            thing.isField.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitField');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitRelationship for a RelationshipDeclaration', () => {
            let thing = sinon.createStubInstance(RelationshipDeclaration);
            thing.isRelationship.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitRelationship');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitEnumValueDeclaration for a EnumValueDeclaration', () => {
            let thing = sinon.createStubInstance(EnumValueDeclaration);
            thing.isEnumValue.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitEnumValueDeclaration');
            mockSpecialVisit.returns('Goose');

            typescriptVisitor.visit(thing, param).should.deep.equal('Goose');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should return visitMapDeclaration for a MapDeclaration', () => {
            let thing = sinon.createStubInstance(MapDeclaration);
            thing.isMapDeclaration.returns(true);
            let mockSpecialVisit = sinon.stub(typescriptVisitor, 'visitMapDeclaration');
            mockSpecialVisit.returns('Duck');

            typescriptVisitor.visit(thing, param).should.deep.equal('Duck');

            mockSpecialVisit.calledWith(thing, param).should.be.ok;
        });

        it('should throw an error when an unrecognised type is supplied', () => {
            let thing = 'Something of unrecognised type';

            (() => {
                typescriptVisitor.visit(thing, param);
            }).should.throw('Unrecognised type: string, value: \'Something of unrecognised type\'');
        });
    });

    describe('visitModelManager', () => {
        it('should call accept for each model file', () => {
            let acceptSpy = sinon.spy();

            let param = {};

            let mockModelManager = sinon.createStubInstance(ModelManager);
            mockModelManager.isModelManager.returns(true);
            mockModelManager.getModelFiles.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }
            ]);

            typescriptVisitor.visitModelManager(mockModelManager, param);

            acceptSpy.withArgs(typescriptVisitor, param).calledTwice.should.be.ok;
        });
    });

    describe('visitModelFile', () => {
        let param;
        beforeEach(() => {
            param = {
                fileWriter: mockFileWriter
            };
        });
        it('should write lines for the imports that are not in own namespace (including super types) ignoring primitives', () => {
            let acceptSpy = sinon.spy();
            let mockEnum = sinon.createStubInstance(EnumDeclaration);
            mockEnum.isEnum.returns(true);
            mockEnum.accept = acceptSpy;

            let property1 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.org1.Property1';
                }
            };

            let property2 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.acme.Property2';
                }
            };

            let property3 = {
                isPrimitive: () => {
                    return true;
                },
                getFullyQualifiedTypeName: () => {
                    return 'super.Property3';
                }
            };

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockClassDeclaration.getSuperType.returns('super.Parent');
            mockClassDeclaration.getProperties.returns([property1, property2, property3]);
            mockClassDeclaration.accept = acceptSpy;

            let mockClassDeclaration2 = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockClassDeclaration2.getSuperType.returns('super.Parent');
            mockClassDeclaration2.getProperties.returns([]);
            mockClassDeclaration2.accept = acceptSpy;

            let mockModelFile = sinon.createStubInstance(ModelFile);
            mockModelFile.getNamespace.returns('org.acme');
            mockModelFile.getAllDeclarations.returns([
                mockEnum,
                mockClassDeclaration,
                mockClassDeclaration2
            ]);
            mockModelFile.getImports.returns([
                'org.org1.Import1',
                'org.org1.Import2',
                'org.org2.Import1',
                'super.Property3',
                'super.Parent'
            ]);
            mockModelFile.imports= [];

            typescriptVisitor.visitModelFile(mockModelFile, param);

            param.fileWriter.openFile.withArgs('org.acme.ts').calledOnce.should.be.ok;
            param.fileWriter.writeLine.callCount.should.deep.equal(6);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, '/* eslint-disable @typescript-eslint/no-empty-interface */']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([0, '// Generated code for namespace: org.acme']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '\n// imports']);
            param.fileWriter.writeLine.getCall(3).args.should.deep.equal([0, 'import {IProperty1} from \'./org.org1\';']);
            param.fileWriter.writeLine.getCall(4).args.should.deep.equal([0, 'import {IParent} from \'./super\';']);
            param.fileWriter.writeLine.getCall(5).args.should.deep.equal([0, '\n// interfaces']);
            param.fileWriter.closeFile.calledOnce.should.be.ok;

            acceptSpy.withArgs(typescriptVisitor, param).calledThrice.should.be.ok;
        });

        it('should write lines for the imports that are not in own namespace ignoring primitives and write lines for importing system type', () => {
            let acceptSpy = sinon.spy();
            let mockEnum = sinon.createStubInstance(EnumDeclaration);
            mockEnum.isEnum.returns(true);
            mockEnum.accept = acceptSpy;

            let property1 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.org1.Property1';
                }
            };

            let property2 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.acme.Property2';
                }
            };

            let property3 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.org1.Property3';
                }
            };

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getProperties.returns([property1, property2, property3]);
            mockClassDeclaration.accept = acceptSpy;

            let mockModelManager = sinon.createStubInstance(ModelManager);
            mockModelManager.isModelManager.returns(true);

            let mockModelFile = sinon.createStubInstance(ModelFile);
            mockModelFile.isModelFile.returns(true);
            mockModelFile.getNamespace.returns('org.acme');
            mockModelFile.getAllDeclarations.returns([
                mockEnum,
                mockClassDeclaration
            ]);
            mockModelFile.getImports.returns([
                'org.org1.Import1',
                'org.org1.Import2',
                'org.org2.Import1'
            ]);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockModelFile.imports= [];
            typescriptVisitor.visitModelFile(mockModelFile, param);

            param.fileWriter.openFile.withArgs('org.acme.ts').calledOnce.should.be.ok;
            param.fileWriter.writeLine.callCount.should.deep.equal(5);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, '/* eslint-disable @typescript-eslint/no-empty-interface */']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([0, '// Generated code for namespace: org.acme']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '\n// imports']);
            param.fileWriter.writeLine.getCall(3).args.should.deep.equal([0, 'import {IProperty1,IProperty3} from \'./org.org1\';']);
            param.fileWriter.writeLine.getCall(4).args.should.deep.equal([0, '\n// interfaces']);
            param.fileWriter.closeFile.calledOnce.should.be.ok;

            acceptSpy.withArgs(typescriptVisitor, param).calledTwice.should.be.ok;
        });

        it('should write lines for the imports of direct subclasses that are not in the same namespace', () => {
            let acceptSpy = sinon.spy();

            let mockSubclassDeclaration1 = sinon.createStubInstance(ClassDeclaration);
            mockSubclassDeclaration1.isClassDeclaration.returns(true);
            mockSubclassDeclaration1.getProperties.returns([]);
            mockSubclassDeclaration1.getNamespace.returns('org.acme.subclasses');
            mockSubclassDeclaration1.getName.returns('ImportedDirectSubclass');

            let mockSubclassDeclaration2 = sinon.createStubInstance(ClassDeclaration);
            mockSubclassDeclaration2.isClassDeclaration.returns(true);
            mockSubclassDeclaration2.getProperties.returns([]);
            mockSubclassDeclaration2.getNamespace.returns('org.acme.subclasses');
            mockSubclassDeclaration2.getName.returns('ImportedDirectSubclass2');

            let mockSubclassDeclaration3 = sinon.createStubInstance(ClassDeclaration);
            mockSubclassDeclaration3.isClassDeclaration.returns(true);
            mockSubclassDeclaration3.getProperties.returns([]);
            mockSubclassDeclaration3.getNamespace.returns('org.acme');
            mockSubclassDeclaration3.getName.returns('LocalDirectSubclass');

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getProperties.returns([]);
            mockClassDeclaration.getDirectSubclasses.returns([
                mockSubclassDeclaration1, mockSubclassDeclaration2, mockSubclassDeclaration3
            ]);
            mockClassDeclaration.accept = acceptSpy;

            let mockModelManager = sinon.createStubInstance(ModelManager);
            mockModelManager.isModelManager.returns(true);

            let mockModelFile = sinon.createStubInstance(ModelFile);
            mockModelFile.isModelFile.returns(true);
            mockModelFile.getNamespace.returns('org.acme');
            mockModelFile.getAllDeclarations.returns([
                mockClassDeclaration,
                mockSubclassDeclaration2
            ]);
            mockModelFile.getImports.returns([]);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockModelFile.imports = [];
            typescriptVisitor.visitModelFile(mockModelFile, param);

            param.fileWriter.openFile.withArgs('org.acme.ts').calledOnce.should.be.ok;
            param.fileWriter.writeLine.callCount.should.deep.equal(6);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, '/* eslint-disable @typescript-eslint/no-empty-interface */']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([0, '// Generated code for namespace: org.acme']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '\n// imports']);
            param.fileWriter.writeLine.getCall(3).args.should.deep.equal([0, '\n// Warning: Beware of circular dependencies when modifying these imports']);
            param.fileWriter.writeLine.getCall(4).args.should.deep.equal([0, 'import type {\n\tIImportedDirectSubclass,\n\tIImportedDirectSubclass2\n} from \'./org.acme.subclasses\';']);
            param.fileWriter.writeLine.getCall(5).args.should.deep.equal([0, '\n// interfaces']);
            param.fileWriter.closeFile.calledOnce.should.be.ok;

            acceptSpy.withArgs(typescriptVisitor, param).calledOnce.should.be.ok;
        });

        it('should write lines for the aliased imports from other namespace ', () => {

            let property1 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.test.basic.file';
                }
            };

            let property2 = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.test.complex.file';
                }
            };

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);

            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getProperties.returns([property1, property2]);
            mockClassDeclaration.getNamespace.returns('org.test.collection');
            mockClassDeclaration.getName.returns('folder');

            mockClassDeclaration.getDirectSubclasses.returns([]);

            let mockModelFile = sinon.createStubInstance(ModelFile);
            mockModelFile.getNamespace.returns('org.test.collection');
            mockModelFile.imports = [
                {
                    '$class': 'concerto.metamodel@1.0.0.ImportTypes',
                    types: ['document', 'file'],
                    namespace: 'org.test.basic',
                    aliasedTypes: [
                        {
                            name: 'file',
                            aliasedName: 'f'
                        }
                    ]
                },
                {
                    '$class': 'concerto.metamodel@1.0.0.ImportTypes',
                    types: ['file'],
                    namespace: 'org.test.complex',
                }
            ];

            mockModelFile.getAllDeclarations.returns([mockClassDeclaration]);
            mockModelFile.getImports.returns(['org.test.basic.file', 'org.test.basic.document', 'org.test.complex.file']);
            typescriptVisitor.visitModelFile(mockModelFile,param);

            param.fileWriter.writeLine.callCount.should.deep.equal(6);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, '/* eslint-disable @typescript-eslint/no-empty-interface */']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([0, '// Generated code for namespace: org.test.collection']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '\n// imports']);
            param.fileWriter.writeLine.getCall(3).args.should.deep.equal([0, 'import {Ifile as If} from \'./org.test.basic\';']);
            param.fileWriter.writeLine.getCall(4).args.should.deep.equal([0, 'import {Ifile} from \'./org.test.complex\';']);
            param.fileWriter.writeLine.getCall(5).args.should.deep.equal([0, '\n// interfaces']);
            param.fileWriter.closeFile.calledOnce.should.be.ok;

        });
    });

    describe('visitEnumDeclaration', () => {
        it('should write the export enum and call accept on each property', () => {
            let acceptSpy = sinon.spy();

            let param = {
                fileWriter: mockFileWriter
            };

            let mockEnumDeclaration = sinon.createStubInstance(EnumDeclaration);
            mockEnumDeclaration.isEnum.returns(true);
            mockEnumDeclaration.getName.returns('Bob');
            mockEnumDeclaration.getOwnProperties.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }]);

            typescriptVisitor.visitEnumDeclaration(mockEnumDeclaration, param);

            param.fileWriter.writeLine.callCount.should.deep.equal(2);
            param.fileWriter.writeLine.withArgs(0, 'export enum Bob {').calledOnce.should.be.ok;
            param.fileWriter.writeLine.withArgs(0, '}\n').calledOnce.should.be.ok;

            acceptSpy.withArgs(typescriptVisitor, param).calledTwice.should.be.ok;
        });
    });

    describe('visitClassDeclaration', () => {
        let param;
        beforeEach(() => {
            param = {
                fileWriter: mockFileWriter
            };
        });
        it('should write the class opening and close', () => {
            let acceptSpy = sinon.spy();

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getOwnProperties.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }]);
            mockClassDeclaration.getName.returns('Bob');

            typescriptVisitor.visitClassDeclaration(mockClassDeclaration, param);

            param.fileWriter.writeLine.callCount.should.deep.equal(3);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, 'export interface IBob {']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([1, '$class: string;']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '}\n']);
        });
        it('should write the class opening and close with abstract and super type', () => {
            let acceptSpy = sinon.spy();

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getOwnProperties.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }]);
            mockClassDeclaration.getName.returns('Bob');
            mockClassDeclaration.isAbstract.returns(true);
            mockClassDeclaration.getSuperType.returns('org.acme.Person');
            param.aliasedTypesMap=new Map();
            typescriptVisitor.visitClassDeclaration(mockClassDeclaration, param);

            param.fileWriter.writeLine.callCount.should.deep.equal(2);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, 'export interface IBob extends IPerson {']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([0, '}\n']);
        });

        it('should create a union given a class that has dependencies but no super class', () => {
            let acceptSpy = sinon.spy();

            let mockChildClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockChildClassDeclaration.isClassDeclaration.returns(true);
            mockChildClassDeclaration.getOwnProperties.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }]);
            mockChildClassDeclaration.getName.returns('Child');
            mockChildClassDeclaration.isAbstract.returns(false);
            mockChildClassDeclaration.getSuperType.returns('Parent');

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getOwnProperties.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }]);
            mockClassDeclaration.getName.returns('Parent');
            mockClassDeclaration.isAbstract.returns(true);
            mockClassDeclaration.getSuperType.returns(null);
            mockClassDeclaration.getDirectSubclasses.returns([mockChildClassDeclaration]);

            typescriptVisitor.visitClassDeclaration(mockClassDeclaration, param);

            param.fileWriter.writeLine.callCount.should.deep.equal(4);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, 'export interface IParent {']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([1, '$class: string;']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '}\n']);
            param.fileWriter.writeLine.getCall(3).args.should.deep.equal([0, 'export type ParentUnion = IChild;\n']);
        });

        it('should not create a union if a class has no sub-classes', () => {
            let acceptSpy = sinon.spy();

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getOwnProperties.returns([{
                accept: acceptSpy
            },
            {
                accept: acceptSpy
            }]);
            mockClassDeclaration.getName.returns('Parent');
            mockClassDeclaration.isAbstract.returns(true);
            mockClassDeclaration.getSuperType.returns(null);
            mockClassDeclaration.getDirectSubclasses.returns([]);

            typescriptVisitor.visitClassDeclaration(mockClassDeclaration, param);

            param.fileWriter.writeLine.callCount.should.deep.equal(3);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, 'export interface IParent {']);
            param.fileWriter.writeLine.getCall(1).args.should.deep.equal([1, '$class: string;']);
            param.fileWriter.writeLine.getCall(2).args.should.deep.equal([0, '}\n']);
        });

        it('should write lines for the extending class declaration using aliased types ', () => {

            let property = {
                isPrimitive: () => {
                    return false;
                },
                getFullyQualifiedTypeName: () => {
                    return 'org.test.basic.file';
                }
            };

            let mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);

            mockClassDeclaration.isClassDeclaration.returns(true);
            mockClassDeclaration.getProperties.returns([property]);
            mockClassDeclaration.getNamespace.returns('org.test.collection');
            mockClassDeclaration.getName.returns('bigFile');
            mockClassDeclaration.getSuperType.returns('org.basic.file');
            mockClassDeclaration.isScalarDeclaration.returns(false);
            mockClassDeclaration.getDirectSubclasses.returns([]);
            mockClassDeclaration.getOwnProperties.returns([]);
            param.aliasedTypesMap = new Map([['org.basic.Ifile', 'If']]);
            typescriptVisitor.visitClassDeclaration(mockClassDeclaration,param);

            param.fileWriter.writeLine.callCount.should.deep.equal(2);
            param.fileWriter.writeLine.getCall(0).args.should.deep.equal([0, 'export interface IbigFile extends If {']);
        });
    });

    describe('visitField', () => {
        let param;
        beforeEach(() => {
            param = {
                fileWriter: mockFileWriter
            };
        });
        it('should write a line for primitive field name and type', () => {
            const mockField = sinon.createStubInstance(Field);
            mockField.isPrimitive.returns(false);
            mockField.getName.returns('name');
            mockField.getType.returns('String');
            mockField.isPrimitive.returns(true);
            typescriptVisitor.visitField(mockField, param);
            param.fileWriter.writeLine.withArgs(1, 'name: string;').calledOnce.should.be.ok;
        });

        it('should convert classes to interfaces', () => {
            const mockField = sinon.createStubInstance(Field);
            mockField.isPrimitive.returns(false);
            mockField.getName.returns('Bob');
            mockField.getType.returns('Person');

            const mockModelManager = sinon.createStubInstance(ModelManager);
            const mockModelFile = sinon.createStubInstance(ModelFile);
            const mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);

            mockModelManager.getType.returns(mockClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockClassDeclaration.getModelFile.returns(mockModelFile);
            mockField.getParent.returns(mockClassDeclaration);
            typescriptVisitor.visitField(mockField, param);

            param.fileWriter.writeLine.withArgs(1, 'Bob: IPerson;').calledOnce.should.be.ok;
        });

        it('should write a line for field name and type thats an array', () => {
            const mockField = sinon.createStubInstance(Field);
            mockField.isPrimitive.returns(false);
            mockField.getName.returns('Bob');
            mockField.getType.returns('Person');
            mockField.isArray.returns(true);

            const mockModelManager = sinon.createStubInstance(ModelManager);
            const mockModelFile = sinon.createStubInstance(ModelFile);
            const mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);

            mockModelManager.getType.returns(mockClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockClassDeclaration.getModelFile.returns(mockModelFile);
            mockField.getParent.returns(mockClassDeclaration);
            typescriptVisitor.visitField(mockField, param);

            param.fileWriter.writeLine.withArgs(1, 'Bob: IPerson[];').calledOnce.should.be.ok;
        });

        it('should write a line for field name who is decorated with union, setting type to be the union type', () => {
            const mockField = sinon.createStubInstance(Field);
            mockField.isPrimitive.returns(false);
            mockField.getName.returns('unionTest');
            mockField.getType.returns('Person');
            mockField.getDecorators.returns([{
                getName: () => {
                    return 'union';
                }
            }]);

            const mockModelManager = sinon.createStubInstance(ModelManager);
            const mockModelFile = sinon.createStubInstance(ModelFile);
            const mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);

            mockModelManager.getType.returns(mockClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockClassDeclaration.getModelFile.returns(mockModelFile);
            mockField.getParent.returns(mockClassDeclaration);
            typescriptVisitor.visitField(mockField, param);

            param.fileWriter.writeLine.withArgs(1, 'unionTest: PersonUnion;').calledOnce.should.be.ok;
        });

        it('should write a line for field name who is decorated with literal, setting type to be the enum value', () => {
            const mockField = sinon.createStubInstance(Field);
            mockField.isPrimitive.returns(false);
            mockField.getName.returns('literalTest');
            mockField.getType.returns('EnumType');
            mockField.getDecorators.returns([{
                getName: () => {
                    return 'literal';
                },
                getArguments: () => {
                    return 'MyEnumValue';
                }
            }]);

            const mockModelManager = sinon.createStubInstance(ModelManager);
            const mockModelFile = sinon.createStubInstance(ModelFile);
            const mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);

            mockModelManager.getType.returns(mockClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockClassDeclaration.getModelFile.returns(mockModelFile);
            mockField.getParent.returns(mockClassDeclaration);
            typescriptVisitor.visitField(mockField, param);

            param.fileWriter.writeLine.withArgs(1, 'literalTest = EnumType.MyEnumValue;').calledOnce.should.be.ok;
        });

        it('should write a line for field name using a union type when the flattenSubclassesToUnion parameter is set', () => {
            const mockField = sinon.createStubInstance(Field);
            mockField.isPrimitive.returns(false);
            mockField.getName.returns('flattenSubclassesTest');
            mockField.getType.returns('Animal');
            mockField.getDecorators.returns([]);

            const mockModelManager = sinon.createStubInstance(ModelManager);
            const mockModelFile = sinon.createStubInstance(ModelFile);
            const mockClassDeclaration = sinon.createStubInstance(ClassDeclaration);
            mockClassDeclaration.getDirectSubclasses.returns(['blah']); // Not valid, but sufficient for this test

            mockModelManager.getType.returns(mockClassDeclaration);
            mockClassDeclaration.isEnum.returns(false);
            mockModelFile.getModelManager.returns(mockModelManager);
            mockClassDeclaration.getModelFile.returns(mockModelFile);
            mockField.getParent.returns(mockClassDeclaration);
            typescriptVisitor.visitField(mockField, { ...param, flattenSubclassesToUnion: true });

            param.fileWriter.writeLine.withArgs(1, 'flattenSubclassesTest: AnimalUnion;').calledOnce.should.be.ok;
        });
    });

    describe('visitEnumValueDeclaration', () => {
        it('should write a line with the name and value of the enum value', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            let mockEnumValueDeclaration = sinon.createStubInstance(EnumValueDeclaration);
            mockEnumValueDeclaration.isEnumValue.returns(true);
            mockEnumValueDeclaration.getName.returns('Bob');

            typescriptVisitor.visitEnumValueDeclaration(mockEnumValueDeclaration, param);

            param.fileWriter.writeLine.withArgs(1, 'Bob = \'Bob\',').calledOnce.should.be.ok;
        });
    });

    describe('visitMapValueDeclaration', () => {

        before(() => {
            sandbox.stub(ModelUtil, 'isScalar').callsFake(() => {
                return false;
            });
        });

        it('should write a line with the name, key and value of the map <String, String>', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            sandbox.restore();
            sandbox.stub(ModelUtil, 'isPrimitiveType').callsFake(() => {
                return true;
            });

            let mockMapDeclaration = sinon.createStubInstance(MapDeclaration);

            const getKeyType = sinon.stub();
            const getValueType = sinon.stub();

            getKeyType.returns('String');
            getValueType.returns('String');
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns({ getType: getKeyType });
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<string, string>;\n').calledOnce.should.be.ok;
        });

        it('should write a line with the name, key and value of the map <String, DateTime>', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            let mockMapDeclaration = sinon.createStubInstance(MapDeclaration);

            const getKeyType    = sinon.stub();
            const getValueType  = sinon.stub();

            getKeyType.returns('String');
            getValueType.returns('DateTime');
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns({ getType: getKeyType });
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<string, Date>;\n').calledOnce.should.be.ok;
        });

        it('should write a line with the name, key and value of the map <String, Address>', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            sandbox.restore();
            sandbox.stub(ModelUtil, 'isScalar').callsFake(() => {
                return false;
            });
            let mockMapDeclaration = sinon.createStubInstance(MapDeclaration);
            let mockMapKeyType     = sinon.createStubInstance(MapKeyType);

            const getKeyType    = sinon.stub();
            const getValueType  = sinon.stub();

            mockMapKeyType.getType.returns('String');
            getKeyType.returns('String');
            getValueType.returns('Address');
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns(mockMapKeyType);
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<string, IAddress>;\n').calledOnce.should.be.ok;
        });

        it('should write a line with the name, key and value of the map <DateTime, Address>', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            sandbox.restore();
            sandbox.stub(ModelUtil, 'isScalar').callsFake(() => {
                return false;
            });
            let mockMapDeclaration = sinon.createStubInstance(MapDeclaration);
            let mockMapKeyType     = sinon.createStubInstance(MapKeyType);

            const getKeyType    = sinon.stub();
            const getValueType  = sinon.stub();

            mockMapKeyType.getType.returns('DateTime');
            getKeyType.returns('DateTime');
            getValueType.returns('Address');
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns(mockMapKeyType);
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<Date, IAddress>;\n').calledOnce.should.be.ok;
        });

        it('should write a line with the name, key and value of the map <String, Concept>', () => {
            let param = {
                fileWriter: mockFileWriter
            };
            sandbox.restore();
            sandbox.stub(ModelUtil, 'isScalar').callsFake(() => {
                return false;
            });

            let mockMapDeclaration = sinon.createStubInstance(MapDeclaration);

            const getKeyType    = sinon.stub();
            const getValueType  = sinon.stub();

            getKeyType.returns('String');
            getValueType.returns('Concept');
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns({ getType: getKeyType });
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<string, IConcept>;\n').calledOnce.should.be.ok;
        });

        it('should write a line with the name, key and value of the map <SSN, String>', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            sandbox.restore();
            sandbox.stub(ModelUtil, 'isScalar').callsFake(() => {
                return true;
            });

            let mockMapDeclaration      = sinon.createStubInstance(MapDeclaration);
            let mockScalarDeclaration   = sinon.createStubInstance(ScalarDeclaration);
            const mockModelFile         = sinon.createStubInstance(ModelFile);

            mockModelFile.getType.returns(ScalarDeclaration);
            const getKeyType    = sinon.stub();
            const getValueType  = sinon.stub();

            mockModelFile.getType.returns(mockScalarDeclaration);
            mockScalarDeclaration.getType.returns('String');
            getKeyType.returns('SSN');
            getValueType.returns('String');
            mockMapDeclaration.getModelFile.returns(mockModelFile);
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns({ getType: getKeyType });
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<string, string>;\n').calledOnce.should.be.ok;
        });

        it('should write a line with the name, key and value of the map <String, SSN>', () => {
            let param = {
                fileWriter: mockFileWriter
            };

            sandbox.restore();
            sandbox.stub(ModelUtil, 'isScalar').callsFake(() => {
                return true;
            });

            let mockMapDeclaration      = sinon.createStubInstance(MapDeclaration);
            let mockScalarDeclaration   = sinon.createStubInstance(ScalarDeclaration);
            const mockModelFile         = sinon.createStubInstance(ModelFile);

            mockModelFile.getType.returns(ScalarDeclaration);
            const getKeyType    = sinon.stub();
            const getValueType  = sinon.stub();

            mockModelFile.getType.returns(mockScalarDeclaration);
            mockScalarDeclaration.getType.returns('String');
            getKeyType.returns('string');
            getValueType.returns('SSN');
            mockMapDeclaration.getModelFile.returns(mockModelFile);
            mockMapDeclaration.getName.returns('Map1');
            mockMapDeclaration.isMapDeclaration.returns(true);
            mockMapDeclaration.getKey.returns({ getType: getKeyType });
            mockMapDeclaration.getValue.returns({ getType: getValueType });

            typescriptVisitor.visitMapDeclaration(mockMapDeclaration, param);

            param.fileWriter.writeLine.withArgs(0, 'export type Map1 = Map<string, string>;\n').calledOnce.should.be.ok;
        });
    });

    describe('visitRelationship', () => {
        let param;
        beforeEach(() => {
            param = {
                fileWriter: mockFileWriter
            };
        });
        it('should write a line for field name and type', () => {
            let mockRelationship = sinon.createStubInstance(RelationshipDeclaration);
            mockRelationship.isRelationship.returns(true);
            mockRelationship.getName.returns('Bob');
            mockRelationship.getType.returns('Person');
            typescriptVisitor.visitRelationship(mockRelationship, param);

            param.fileWriter.writeLine.withArgs(1, 'Bob: IPerson;').calledOnce.should.be.ok;
        });

        it('should write a line for field name and type thats an array', () => {
            let mockField = sinon.createStubInstance(Field);
            mockField.isField.returns(true);
            mockField.getName.returns('Bob');
            mockField.getType.returns('Person');
            mockField.isArray.returns(true);
            typescriptVisitor.visitRelationship(mockField, param);

            param.fileWriter.writeLine.withArgs(1, 'Bob: IPerson[];').calledOnce.should.be.ok;
        });
    });

    describe('toTsType', () => {
        it('should return Date for DateTime', () => {
            typescriptVisitor.toTsType('DateTime').should.deep.equal('Date');
        });
        it('should return boolean for Boolean', () => {
            typescriptVisitor.toTsType('Boolean').should.deep.equal('boolean');
        });
        it('should return string for String', () => {
            typescriptVisitor.toTsType('String').should.deep.equal('string');
        });
        it('should return number for Double', () => {
            typescriptVisitor.toTsType('Double').should.deep.equal('number');
        });
        it('should return number for Long', () => {
            typescriptVisitor.toTsType('Long').should.deep.equal('number');
        });
        it('should return number for Integer', () => {
            typescriptVisitor.toTsType('Integer').should.deep.equal('number');
        });
        it('should return passed in type by default', () => {
            typescriptVisitor.toTsType('Penguin').should.deep.equal('Penguin');
        });
    });
});

