import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import ConfigService from '../../config/config.service';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(ElasticsearchService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get('ELASTICSEARCH_NODE'),
    });
  }

  async onModuleInit() {
    try {
      const health = await this.client.cluster.health();
      this.logger.log(`Elasticsearch connected successfully. Status: ${health.status}`);
    } catch (error) {
      this.logger.error('Failed to connect to Elasticsearch:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  getClient(): Client {
    return this.client;
  }

  async createIndex(index: string, mapping?: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    const exists = await this.client.indices.exists({ index: indexName });
    if (!exists) {
      await this.client.indices.create({
        index: indexName,
        body: mapping ? { mappings: mapping } : undefined,
      });
      this.logger.log(`Index '${indexName}' created successfully`);
    }
  }

  async indexDocument(index: string, id: string, document: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    await this.client.index({
      index: indexName,
      id,
      body: document,
    });
  }

  async updateDocument(index: string, id: string, document: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    await this.client.update({
      index: indexName,
      id,
      body: { doc: document },
    });
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    const indexName = this.getIndexName(index);
    
    await this.client.delete({
      index: indexName,
      id,
    });
  }

  async search(index: string, query: any): Promise<any> {
    const indexName = this.getIndexName(index);
    
    return await this.client.search({
      index: indexName,
      body: query,
    });
  }

  async bulkIndex(index: string, documents: Array<{ id: string; doc: any }>): Promise<void> {
    const indexName = this.getIndexName(index);
    
    const body = documents.flatMap(({ id, doc }) => [
      { index: { _index: indexName, _id: id } },
      doc,
    ]);

    await this.client.bulk({ body });
  }

  private getIndexName(index: string): string {
    const prefix = this.configService.get('ELASTICSEARCH_INDEX_PREFIX');
    return prefix ? `${prefix}_${index}` : index;
  }
}
