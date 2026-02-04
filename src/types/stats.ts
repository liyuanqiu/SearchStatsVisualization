export interface Counter {
  Usage: number;
  Quota: number | null;
}

export interface Counters {
  DocumentCounter: Counter;
  IndexCounter: Counter;
  IndexerCounter: Counter;
  DataSourceCounter: Counter;
  StorageSizeCounter: Counter;
  SynonymMapCounter: Counter;
  SkillsetCounter: Counter;
  VectorIndexSizeCounter: Counter;
}

export interface Limits {
  MaxFieldsPerIndex: number;
  MaxFieldNestingDepthPerIndex: number;
  MaxComplexCollectionFieldsPerIndex: number;
  MaxComplexObjectsInCollectionsPerDocument: number;
  MaxStoragePerIndexInBytes: number | null;
}

export interface ServiceStatistics {
  Counters: Counters;
  Limits: Limits;
}

export interface IndexStatistic {
  name: string;
  documentCount: number;
  storageSize: number;
  vectorIndexSize: number;
}

export interface IndexStatistics {
  "@odata.context": string;
  value: IndexStatistic[];
}

export interface SearchStat {
  endpoint: string;
  serviceStatistics: ServiceStatistics;
  indexStatistics: IndexStatistics;
}

export interface StatsData {
  searchStats: SearchStat[];
}
