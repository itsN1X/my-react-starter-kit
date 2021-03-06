import formatString from '../utils/string-format';
import {sanitizeInput, executeQuery} from '../db/query';

export function findBy(table, column, value) {
    return new Promise((resolve, reject) => {
        executeQuery(
            formatString("select * from {0} where {1} = '{2}'",
                table,
                column,
                sanitizeInput(value)
            ),
            (results, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

export function findByUnique(table, column, value) {
    return new Promise((resolve, reject) => {
        findBy(table, column, value)
            .then((results) => {
                if (results && results.length === 1) {
                    resolve(results[0]);
                } else {
                    reject(formatString('Found {0} results from {1}',
                        (results ? results.length : 0),
                        table
                    ));
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export function get(table, id, idColumn = 'id') {
    return findByUnique(table, idColumn, id);
}

export function create(table, columnValues) {
    // ES6 standard promises that these are in the same order
    const columns = Object.keys(columnValues);
    let values = Object.values(columnValues);
    values = values.map((value) => sanitizeInput(value));
    values = values.map((value) => {
        if (typeof value === 'string') {
            return "'" + value + "'";
        } else if (typeof value === 'undefined') {
            return 'NULL';
        }
        return value;
    });
    const columnsString = columns.join();
    const valuesString = values.join();

    return new Promise((resolve, reject) => {
        executeQuery(
            formatString('insert into {0} ({1}) values ({2}) returning *',
                table,
                columnsString,
                valuesString
            ),
            (results, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            }
        );
    });
}

export function update(table, id, columnValues, {idColumn} = {idColumn: 'id'}) {
    // ES6 standard promises that these are in the same order
    const columns = Object.keys(columnValues);
    let values = Object.values(columnValues);
    values = values.map((value) => sanitizeInput(value));
    values = values.map((value) => {
        if (typeof value === 'string') {
            return "'" + value + "'";
        } else if (typeof value === 'undefined') {
            return 'NULL';
        }
        return value;
    });
    const columnsString = columns.join();
    const valuesString = values.join();

    return new Promise((resolve, reject) => {
        executeQuery(
            formatString('update {0} set ({1}) = ({2}) where {3} = {4} returning *',
                table,
                columnsString,
                valuesString,
                idColumn,
                sanitizeInput(id)
            ),
            (results, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            }
        );
    });
}

export function count(table) {
    return new Promise((resolve, reject) => {
        executeQuery(
            formatString('select count(1) from {0}',
                table
            ),
            (results, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            }
        );
    });
}

export function list(table, {sort, ascending, offset, cursor, pageSize}) {
    let query = formatString('select * from {0}', table);
    if (sort) {
        if (cursor) {
            query += formatString(' where {0} {1} {2}', sort, (ascending ? '>' : '<'), cursor);
        }
        query += formatString(' order by {0} {1}', sort, (ascending ? 'asc' : 'desc'));
    }
    if (!cursor && offset) {
        query += formatString(' offset {0}', offset);
    }
    if (pageSize && pageSize !== 'infinity') {
        query += formatString(' limit {0}', pageSize);
    }
    return new Promise((resolve, reject) => {
        executeQuery(
            query,
            (results, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

export function deleteWhere(table, column, value) {
    return new Promise((resolve, reject) => {
        executeQuery(
            formatString("delete from {0} where {1} = '{2}'",
                table,
                column,
                sanitizeInput(value)
            ),
            (results, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

export function deleteRow(table, id, idColumn = 'id') {
    return deleteWhere(table, idColumn, id);
}
