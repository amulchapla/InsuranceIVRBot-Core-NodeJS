import async = require('async');
import { QueryOptions, SearchCallback, SearchResponse, SearchResult, SearchResultDocument } from 'azure-search-client';
import { Entity, LuisResult } from 'cognitive-luis-client';
import { SpeechResult } from 'cognitive-speech-client';
import _ from './lodash-mixins';
import { SEARCH } from './services';
import { SEARCH_SETTINGS } from './settings';
import { getEntityScopes, setImmediate } from './util';

export interface SkuAttributes {
  [key: string]: string;
}
export interface ProductSku extends SkuAttributes {
  productNumber: string;
}
export interface ProductSkuSelection {
  skus: ProductSku[];
  entities: Entity[];
  selected: SkuAttributes;
  product: string;
  attribute?: string;
}

export type FindProductCallback = (err: Error, matches: SearchResultDocument[]) => void;

class App {
  findProduct(speech: SpeechResult, luis: LuisResult, callback: FindProductCallback): void {
    const query = this.getProductQuery(speech.header.name, luis.entities);

    async.waterfall([
      (next: SearchCallback<SearchResult>) => {
        SEARCH.search(SEARCH_SETTINGS.index, query, next);
      },
      (searchResp: SearchResponse<SearchResult>, next: FindProductCallback) => {
        const candidates = this.rankProducts(speech.header.name, searchResp.result.value);
        // const resultsWithAllEntities = searchResp.result.value
        //   .filter((doc) => util.hasAllEntities(doc, luis.entities, SEARCH_SETTINGS.entities));
        setImmediate(next, null, candidates);
      },
    ], callback);
  }

  rankProducts(queryText: string, searchResults: SearchResultDocument[]): SearchResultDocument[] {
    const queryTokens = this.tokenize(queryText);
    return _.chain(searchResults)
      .each((result) => {
        const resultTokens = this.tokenize(result.name);
        result.$score = _.xdiff(resultTokens, queryTokens).length / resultTokens.length;
      })
      .sortBy('$score')
      .takeWhile((x, i, array) => i === 0 || x.$score === array[i - 1].$score)
      .value();
  }

  getSkuChoices(args: ProductSkuSelection): ProductSku[] {

    // map entities to selected attributes
    args.entities
      .map((entity) => {
        return {
          // entity detected by luis
          entity,

          // map to search and sku fields
          mapping: _.find(SEARCH_SETTINGS.entities, {entity: entity.type}),
        };
      })

      // omit entities with no map
      .filter((x) => x.mapping && x.mapping.sku)

      // set attribute selection for entity
      .forEach((x) => {
        const canonical = x.entity.resolution.values[0].toLowerCase();

        // only if this entity value is valid for at least 1 sku
        if (args.skus.some((sku) => sku[x.mapping.sku].toLowerCase() === canonical)) {
          args.selected[x.mapping.sku] = canonical;
        }

        // todo return invalid entity value to user
      });

    // limit skus to selected attributes
    _.each(args.selected, (value, attribute) => {
      args.skus = args.skus.filter((sku) => sku[attribute].toLowerCase() === value.toLowerCase());
    });
    return args.skus;
  }

  getNextSkuAttribute(skus: ProductSku[]): {name: string, choices: string[]} {

    // TODO handle 0 skus
    const sets = skus.reduce((sets, sku) => {
      Object.keys(sku)
        .filter((attr) => attr !== 'productNumber')
        .forEach((attr) => {
          sets[attr] = sets[attr] || new Set<string>();
          sets[attr].add(sku[attr]);
        });
      return sets;
    }, {});

    return Object.keys(sets)
      .map((attr) => ({
        choices: Array.from<string>(sets[attr]),
        name: attr,
      })).find((x) => x.choices.length > 1);
  }

  private tokenize(text: string): string[] {
    return text.replace(/\W/g, ' ').trim().toLowerCase().split(/\s+/);
  }

  private getProductQuery(searchText: string, entities: Entity[]): QueryOptions {
    const entityScopes = getEntityScopes(entities, SEARCH_SETTINGS.entities);
    return {
      queryType: 'full',
      search: `${searchText} ${entityScopes}`,
      select: 'name,category,colors,sizes,sex,products,description_EN',
      top: 3,
    };
  }
}

export const APP = new App();
