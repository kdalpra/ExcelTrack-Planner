import * as SQLite from 'expo-sqlite';

const databaseName = 'Terms.db';
const db = SQLite.openDatabase(databaseName);


export default db;