const mysqlInitFn = require('../index');
const {MySqlContainer} = require("testcontainers/dist/modules/mysql/mysql-container");

jest.setTimeout(90000);

describe('MySqlDriver', () => {
    let container;
    let mysql;


    beforeAll(async () => {
        container = await new MySqlContainer()
            .withDatabase("test")
            .start();

        const config = {
            host: container.getHost(),
            port: container.getPort(),
            database: container.getDatabase(),
            user: container.getUsername(),
            password: container.getUserPassword(),
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 1000,
            connectTimeout: 10000,
        }

        mysql = mysqlInitFn(config);
    });

    afterAll(async () => {
        await mysql.stop();
        if (container) {
            await container.stop();
        }
    });

    test("table created ", async () => {

        await mysql.query(`

            CREATE TABLE if not exists user
            (
                id   INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50)
            );
        `)

        await mysql.query('truncate table user');
        expect(await mysql.query(`SHOW TABLES LIKE 'user';`)).toHaveLength(1)
    });

    test("table is empty ", async () => {

        let res = await mysql.query(`select count(1) as count
                                     from user`);
        expect(res[0]['count']).toStrictEqual(0)
    });


    test("COMMITTED transaction ", async () => {

        //
        await mysql.bulk('insert into user (id, name) values ?', [[222, 'xxx_xxx']]);
        let user = await mysql.query(`select id, name
                                      from user
                                      where id = ?`, [222]);

        expect(user[0].name).toStrictEqual('xxx_xxx');


        await mysql.transactional(async conn => {

            await conn.query('UPDATE user SET name = ? where id = ?', ['TTTTTTT', '222']);
            //add many update queries ...
        });

        let updatedUser = await mysql.query(`select id, name
                                             from user
                                             where id = ?`, [222]);

        expect(updatedUser[0].name).toStrictEqual('TTTTTTT');
    });

    test("ROLLBACK transaction (data haven't changed)", async () => {

        //
        await mysql.bulk('insert into user (id, name) values ?', [[333, 'xxx_xxx']]);
        let user = await mysql.query('select id, name from user where id = ?', [333]);

        expect(user[0].name).toStrictEqual('xxx_xxx');

        // try {
        //     ;
        // } catch (e) {
        //     //do nothing
        // }
        // bigger than name length in table
        // let bigValue = "";
        // for (let i = 0; i < 50; i++) {
        //     bigValue += "TT";
        // }

        try {
            await mysql.transactional(async conn => {
                await conn.query('UPDATE user SET name = ? where id = ?', ["any val", '333']);
                throw new Error("unexpected error!!");
            })
        } catch (e) {
            // console.log("Data too long for column 'name' at row 1");
            // handle the error
        }

        let updatedUser = await mysql.query('select id, name from user where id = ?', [333]);

        expect(updatedUser[0].name).toStrictEqual('xxx_xxx');
    });

    test('insert bulk', async () => {
        jest.setTimeout(60000);
        let input = [];

        for (let i = 0; i < 10; i++) {
            input.push([i, `test ${i}`])
        }

        await mysql.bulk('insert into user (id, name) VALUES ? ', input);
    },);

    test(`select one row using the direct pool api
    not recommended as you have to release
    the connection your self`,
        async () => {
            let query = `SELECT name
                         from user
                         where id = ?`;
            let params = [333]


            const connection = await mysql.pool.getConnection();
            let [res,] = await connection.execute(query, params);

            await connection.release();

            expect(res).toHaveLength(1)
        });

    test("query insert with on DUPLICATE KEY UPDATE test", async () => {

        await mysql.query(
            `INSERT INTO user (id, name)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name)`, [250, 'test user name']
        )
        let [user] = await mysql.query('select name from user where id =?', [250]);

        expect(user.name).toStrictEqual('test user name')

        await mysql.query(
            `INSERT INTO user (id, name)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name)`, [250, 'test user name updated']
        )

        let [userUpdated] = await mysql.query('select name from user where id =?', [250]);

        expect(userUpdated.name).toStrictEqual('test user name updated')

    });

});
