db = db.getSiblingDB('newsaccess');

db.createCollection('users');
db.createCollection('publishers');
db.createCollection('transactions');
db.createCollection('subscriptions');

db.users.createIndex({ email: 1 }, { unique: true });
db.publishers.createIndex({ id: 1 }, { unique: true });
db.publishers.createIndex({ domain: 1 }, { unique: true });
db.transactions.createIndex({ userId: 1 });
db.transactions.createIndex({ transactionId: 1 }, { unique: true });
db.subscriptions.createIndex({ userId: 1, publisherId: 1 });

db.publishers.insertMany([
  {
    id: 'nyt',
    name: 'The New York Times',
    domain: 'nytimes.com',
    active: true,
    revenueShare: 0.70,
    defaultArticlePrice: 0.99,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ft',
    name: 'The Financial Times',
    domain: 'ft.com',
    active: true,
    revenueShare: 0.70,
    defaultArticlePrice: 0.75,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wsj',
    name: 'The Wall Street Journal',
    domain: 'wsj.com',
    active: true,
    revenueShare: 0.70,
    defaultArticlePrice: 0.85,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wapo',
    name: 'The Washington Post',
    domain: 'washingtonpost.com',
    active: true,
    revenueShare: 0.70,
    defaultArticlePrice: 0.65,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB initialized successfully');