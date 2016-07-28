import test = require('blue-tape');

import * as OracleDB from 'oracledb';

let usr = process.env["ORA_USR"] || "hr";
let pwd = process.env["ORA_PWD"] || "welcome";
let ins = process.env["ORA_INS"] || "localhost/XE";
let sql = process.env["ORA_SQL"] || ("SELECT department_id, department_name " +
			"FROM departments " +
	"WHERE manager_id < :id");
let param = process.env["ORA_PARAM"] || 110;

test('Callback test', t => {
	OracleDB.getConnection(
		{
			user: usr,
			password: pwd,
			connectString: ins
		},
		function (err, connection) {
			t.error(err);
			connection.execute(
				sql,
				[param],
				function (err, result) {
					t.error(err);
					connection.release(err => {
						t.error(err);
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
		let hadAnError :any = undefined;
		return connection.execute(sql, [param]
		).catch((err: any) => {
			hadAnError = err;
		}).then(() => {
			return connection.release().then(() => {
				if(hadAnError) throw hadAnError;
			});
		});
	});
});