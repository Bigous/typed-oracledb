import test = require('blue-tape');

import * as OracleDB from 'oracledb';

/* tslint:disable no-string-literal */
let usr = process.env['ORA_USR'] || 'hr';
let pwd = process.env['ORA_PWD'] || 'welcome';
let ins = process.env['ORA_INS'] || 'localhost/XE';
let sql = process.env['ORA_SQL'] || ('SELECT department_id, department_name ' +
	'FROM departments ' +
	'WHERE manager_id < :id');
let param = process.env['ORA_PARAM'] || 110;
/* tslint:enable no-string-literal */

test('Callback test', t => {
	OracleDB.getConnection(
		{
			user: usr,
			password: pwd,
			connectString: ins
		},
		function (err1, connection) {
			t.error(err1);
			connection.execute(
				sql,
				[param],
				function (err2, result) {
					t.error(err2);
					connection.release(err3 => {
						t.error(err3);
						t.end();
					});
				}
			);
		}
	);
});

test('Promise test', t => {
	return OracleDB.getConnection(
		{
			user: usr,
			password: pwd,
			connectString: ins
		}
	).then((connection: OracleDB.IConnection) => {
		let hadAnError: any = undefined;
		return connection.execute(sql, [param]
		).catch((err: any) => {
			hadAnError = err;
		}).then(() => {
			return connection.release().then(() => {
				if (hadAnError) {
					throw hadAnError;
				}
			});
		});
	});
});

test('Pool', t => {
	return OracleDB.createPool(
		{
			user: usr,
			password: pwd,
			connectString: ins,
			poolAlias: 'sbrubles'
		})
		.then(pool => pool.getConnection())
		.then(connection => {
			let hadAnError: any = undefined;
			return connection.execute(sql, [param]
			).catch((err: any) => {
				hadAnError = err;
			}).then(() => {
				return connection.release().then(() => {
					if (hadAnError) {
						throw hadAnError;
					}
				});
			});
		});
});

test('Pool cache', t => {
	return OracleDB.getPool('sbrubles').getConnection().then(connection => {
		let hadAnError: any = undefined;
		return connection.execute(sql, [param]
		).catch((err: any) => {
			hadAnError = err;
		}).then(() => {
			return connection.release().then(() => {
				if (hadAnError) {
					throw hadAnError;
				}
			});
		});
	});
});
