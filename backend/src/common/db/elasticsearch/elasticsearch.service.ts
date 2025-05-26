import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import ConfigService from '../../config/config.service';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(ElasticsearchService.name);  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get('ELASTICSEARCH_NODE'),
      // Configure the client to be compatible with Elasticsearch 8.x
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        username: this.configService.get('ELASTICSEARCH_USERNAME') || '',
        password: this.configService.get('ELASTICSEARCH_PASSWORD') || ''
      }
      // No additional headers needed when using appropriate client version
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
  }  async createIndex(index: string, mapping?: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          body: mapping ? { mappings: mapping } : undefined,
        });
        this.logger.log(`Index '${indexName}' created successfully`);
      }
    } catch (error) {
      this.logger.error(`Error creating index ${indexName}: ${error.message}`, error);
      throw error;
    }
  }async indexDocument(index: string, id: string, document: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    try {
      // Using Elasticsearch 8.x compatible syntax
      await this.client.index({
        index: indexName,
        id,
        body: document,
      });
      
      this.logger.log(`Document indexed successfully: ${indexName}/${id}`);
    } catch (error) {
      this.logger.error(`Error indexing document: ${error.message}`, error);
      throw error;
    }
  }  async updateDocument(index: string, id: string, document: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    try {
      // Use upsert to create the document if it doesn't exist, or update if it does
      await this.client.update({
        index: indexName,
        id,
        body: { 
          doc: document,
          doc_as_upsert: true 
        },
      });
    } catch (error) {
      this.logger.error(`Error updating document: ${error.message}`, error);
      throw error;
    }
  }

  async upsertDocument(index: string, id: string, document: any): Promise<void> {
    const indexName = this.getIndexName(index);
    
    try {
      // Explicitly upsert: create if doesn't exist, update if it does
      await this.client.update({
        index: indexName,
        id,
        body: { 
          doc: document,
          doc_as_upsert: true 
        },
      });
      this.logger.log(`Document upserted successfully: ${indexName}/${id}`);
    } catch (error) {
      this.logger.error(`Error upserting document: ${error.message}`, error);
      throw error;
    }
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    const indexName = this.getIndexName(index);
    
    await this.client.delete({
      index: indexName,
      id,
    });
  }  async search(index: string, query: any): Promise<any> {
    const indexName = this.getIndexName(index);
    
    try {
      return await this.client.search({
        index: indexName,
        body: query,
      });
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`, error);
      throw error;
    }
  }  async bulkIndex(index: string, documents: Array<{ id: string; doc: any }>): Promise<void> {
    const indexName = this.getIndexName(index);
    
    const operations = documents.flatMap(({ id, doc }) => [
      { index: { _index: indexName, _id: id } },
      doc,
    ]);

    try {
      await this.client.bulk({ 
        body: operations,
      });
    } catch (error) {
      this.logger.error(`Error bulk indexing documents: ${error.message}`, error);
      throw error;
    }
  }

  private getIndexName(index: string): string {
    const prefix = this.configService.get('ELASTICSEARCH_INDEX_PREFIX');
    return prefix ? `${prefix}_${index}` : index;
  }
}
