import axios from 'axios';
import { Publisher } from '../models/Publisher';
import { logger } from '../utils/logger';

interface PublisherConfig {
  apiEndpoint: string;
  apiKey: string;
}

export class PublisherIntegration {
  private static publisherConfigs: Map<string, PublisherConfig> = new Map();

  static async init(): Promise<void> {
    try {
      const publishers = await Publisher.find({ active: true });

      publishers.forEach(publisher => {
        if (publisher.apiEndpoint && publisher.apiKey) {
          this.publisherConfigs.set(publisher.id, {
            apiEndpoint: publisher.apiEndpoint,
            apiKey: publisher.apiKey
          });
        }
      });

      logger.info(`Initialized ${this.publisherConfigs.size} publisher integrations`);
    } catch (error: any) {
      logger.error('Failed to initialize publisher integrations:', error);
    }
  }

  static async getArticleInfo(publisherId: string, articleId: string): Promise<any> {
    const config = this.publisherConfigs.get(publisherId);
    
    if (!config) {
      return {
        articleId,
        title: 'Sample Article Title',
        author: 'John Doe',
        publishDate: new Date(),
        price: 0.75,
        publisher: publisherId
      };
    }

    try {
      const response = await axios.get(`${config.apiEndpoint}/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      logger.error(`Error getting article info from ${publisherId}:`, error);
      
      return {
        articleId,
        title: 'Sample Article Title',
        author: 'Unknown',
        publishDate: new Date(),
        price: 0.75,
        publisher: publisherId
      };
    }
  }

  static async getArticleAccess(
    publisherId: string,
    articleId: string,
    transactionId: string
  ): Promise<string> {
    const config = this.publisherConfigs.get(publisherId);

    if (!config) {
      return `access_token_${publisherId}_${articleId}_${Date.now()}`;
    }

    try {
      const response = await axios.post(
        `${config.apiEndpoint}/articles/${articleId}/access`,
        {
          transactionId,
          platform: 'NewsAccess',
          timestamp: Date.now()
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.accessToken;
    } catch (error: any) {
      logger.error(`Error getting article access from ${publisherId}:`, error);
      return `access_token_${publisherId}_${articleId}_${Date.now()}`;
    }
  }

  static async verifyAccess(publisherId: string, accessToken: string): Promise<boolean> {
    const config = this.publisherConfigs.get(publisherId);

    if (!config) {
      return accessToken.startsWith('access_token_');
    }

    try {
      const response = await axios.post(
        `${config.apiEndpoint}/access/verify`,
        { accessToken },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.valid === true;
    } catch (error: any) {
      logger.error(`Error verifying access with ${publisherId}:`, error);
      return false;
    }
  }
}
