import _ = require('lodash');
import { SearchResultDocument } from 'azure-search-client';
import { IRecognitionChoice } from 'botbuilder-calling';
import { Entity } from 'cognitive-luis-client';

export interface SearchEntityMapping {
  entity: string;
  field: string;
  weight?: number;
}

export function setImmediate<T>(callback: (err: Error, result: T) => void, err: Error, result: T): void {
  global.setImmediate(callback, err, result);
}

export function prompt(...segments: string[]): string {
  return _(segments).flatten().compact().join(' ');
}

export function promptChoices(values: string[], dtmf = true): {prompt: string, values: IRecognitionChoice[]} {
  const text = values.map((x, i) => `For ${x},${dtmf && i === 0 ? ' press or ' : ' '}say ${i + 1}`).join('. ') + '.';
  const choices = values.map((x, i) => ({
    dtmfVariation: (i + 1).toString(),
    name: x,
    speechVariation: [ x, (i + 1).toString() ],
  } as IRecognitionChoice));
  return {prompt: text, values: choices};
}

export function getEntityScopes(entities: Entity[], mapping: SearchEntityMapping[]): string {
  return entities
    .map((x) => {
      return { mapping: _.find(mapping, {entity: x.type}), entity: x };
    })
    .filter((x) => x.mapping)
    .map((x) => {
      const canonical = x.entity.resolution.values[0];
      const weight = x.mapping.weight ? `^${x.mapping.weight}` : '';
      return `${x.mapping.field}:'${canonical}'${weight}`;
    }).join(' ');
}

export function rejectSubEntities(entities: Entity[]): Entity[] {
  return entities.filter((x, i, array) => {
    return !array.some((y) => x !== y && isSubEntity(x, y));
  });

  function isSubEntity(a: Entity, b: Entity): boolean {
    return a.startIndex >= b.startIndex && a.endIndex <= b.endIndex;
  }
}

export function hasAllEntities(document: SearchResultDocument, entities: Entity[], mapping: SearchEntityMapping[]): boolean {
  return entities
    .map((x) => ({
      entity: x,
      map: _.find(mapping, {entity: x.type}),
    }))
    .filter((x) => x.map)
    .every((x) => {
      const value = _.get(document, x.map.field);
      const canonical = _.keys(x.entity.resolution)[0]; // TODO filter where !resolution
      return Array.isArray(value) ? _.includes(value, canonical) : value === canonical;
    });
}
