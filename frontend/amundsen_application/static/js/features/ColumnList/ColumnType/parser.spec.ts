import * as Parser from './parser';

describe('getTruncatedText', () => {
  it('returns correct text', () => {
    const nestedType: Parser.NestedType = {
      head: 'hello<',
      children: ['how are you'],
      tail: '>',
    };
    const expected = 'hello<...>';

    expect(Parser.getTruncatedText(nestedType)).toEqual(expected);
  });

  it('returns correct text with delimeters removed', () => {
    const nestedType: Parser.NestedType = {
      head: 'hello<',
      children: ['how are you'],
      tail: '>,',
    };
    const expected = 'hello<...>';

    expect(Parser.getTruncatedText(nestedType)).toEqual(expected);
  });
});

describe('isNestedType', () => {
  it('returns true for supported complex types', () => {
    expect(Parser.isNestedType('struct<hello, goodbye>', 'hive')).toEqual(true);
  });

  it('returns false for unsupported complex types', () => {
    expect(Parser.isNestedType('xyz<hello, goodbye>', 'hive')).toEqual(false);
  });

  it('returns false for unsupported databases', () => {
    expect(Parser.isNestedType('struct<hello, goodbye>', 'xyz')).toEqual(false);
  });

  it('returns false for non-complex types', () => {
    expect(Parser.isNestedType('string', 'hive')).toEqual(false);
  });

  it('returns true for complex delta types', () => {
    expect(Parser.isNestedType('struct<col1:string>', 'delta')).toEqual(true);
  });

  it('returns false for non-complex delta types', () => {
    expect(Parser.isNestedType('bigint', 'delta')).toEqual(false);
  });
});

describe('parseNestedType', () => {
  it('returns null if not a complex type', () => {
    expect(Parser.parseNestedType('test', 'hive')).toEqual(null);
  });

  describe('hive support', () => {
    it('returns expected NestedType for nested structs', () => {
      const columnType =
        'array<struct<amount:bigint,column:struct<column_id:string,name:string,template:struct<code:string,currency:string>>,id:string>>';
      const expected: Parser.NestedType = {
        head: 'array<',
        name: '',
        col_type: '',
        children: [
          {
            head: 'struct<',
            col_type: '',
            name: '',
            children: [
              'amount:bigint,',
              {
                head: 'column:struct<',
                col_type:
                  'struct<column_id:string,name:string,template:struct<code:string,currency:string>>',
                name: 'column',
                children: [
                  'column_id:string,',
                  'name:string,',
                  {
                    head: 'template:struct<',
                    col_type: 'struct<code:string,currency:string>',
                    name: 'template',
                    children: ['code:string,', 'currency:string'],
                    tail: '>',
                  },
                ],
                tail: '>,',
              },
              'id:string',
            ],
            tail: '>',
          },
        ],
        tail: '>',
      };

      expect(Parser.parseNestedType(columnType, 'hive')).toEqual(expected);
    });
  });

  describe('presto support', () => {
    it('returns expected NestedType for row', () => {
      const columnType =
        'row("c0_test" timestamp(3),"c1" row("c2" timestamp(3),"c3_test" varchar,"c4" double,"c5" double,"c6" row("c7" varchar,"c8" varchar),"c9" row("c10" varchar,"c11" varchar,"c12" row("c13_id" varchar,"c14" varchar)))';
      const expected: Parser.NestedType = {
        head: 'row(',
        col_type: '',
        name: '',
        children: [
          'c0_test timestamp(3),',
          {
            head: 'c1 row(',
            name: 'c1',
            col_type:
              'row(c2 timestamp(3),c3_test varchar,c4 double,c5 double,c6 row(c7 varchar,c8 varchar),c9 row(c10 varchar,c11 varchar,c12 row(c13_id varchar,c14 varchar)))',
            children: [
              'c2 timestamp(3),',
              'c3_test varchar,',
              'c4 double,',
              'c5 double,',
              {
                head: 'c6 row(',
                name: 'c6',
                col_type: 'row(c7 varchar,c8 varchar)',
                children: ['c7 varchar,', 'c8 varchar'],
                tail: '),',
              },
              {
                head: 'c9 row(',
                name: 'c9',
                col_type:
                  'row(c10 varchar,c11 varchar,c12 row(c13_id varchar,c14 varchar))',
                children: [
                  'c10 varchar,',
                  'c11 varchar,',
                  {
                    head: 'c12 row(',
                    name: 'c12',
                    col_type: 'row(c13_id varchar,c14 varchar)',
                    children: ['c13_id varchar,', 'c14 varchar'],
                    tail: ')',
                  },
                ],
                tail: ')',
              },
            ],
            tail: ')',
          },
        ],
        tail: ')',
      };

      expect(Parser.parseNestedType(columnType, 'presto')).toEqual(expected);
    });

    it('returns expected NestedType for array', () => {
      const columnType =
        'array(row("total" bigint,"currency" varchar,"status" varchar,"payments" array(row("method" varchar,"payment" varchar,"amount" bigint,"authed" bigint,"id" varchar)),"id" varchar,"line_items" array(row("type" varchar,"amount" bigint,"id" varchar))))';
      const expected: Parser.NestedType = {
        head: 'array(',
        name: '',
        col_type: '',
        children: [
          {
            head: 'row(',
            name: '',
            col_type: '',
            children: [
              'total bigint,',
              'currency varchar,',
              'status varchar,',
              {
                head: 'payments array(',
                name: 'payments',
                col_type:
                  'array(row(method varchar,payment varchar,amount bigint,authed bigint,id varchar))',
                children: [
                  {
                    head: 'row(',
                    name: '',
                    col_type: '',
                    children: [
                      'method varchar,',
                      'payment varchar,',
                      'amount bigint,',
                      'authed bigint,',
                      'id varchar',
                    ],
                    tail: ')',
                  },
                ],
                tail: '),',
              },
              'id varchar,',
              {
                head: 'line_items array(',
                name: 'line_items',
                col_type: 'array(row(type varchar,amount bigint,id varchar))',
                children: [
                  {
                    head: 'row(',
                    name: '',
                    col_type: '',
                    children: ['type varchar,', 'amount bigint,', 'id varchar'],
                    tail: ')',
                  },
                ],
                tail: ')',
              },
            ],
            tail: ')',
          },
        ],
        tail: ')',
      };

      expect(Parser.parseNestedType(columnType, 'presto')).toEqual(expected);
    });
  });

  describe('delta support', () => {
    it('returns expected NestedType for struct', () => {
      const columnType =
        'struct_col:struct<col1:string,col2:bigint,col3:boolean,nested_col:struct<col1:string,col2:bigint>>';
      const expected: Parser.NestedType = {
        head: 'struct_col:struct<',
        name: 'struct_col',
        col_type:
          'struct<col1:string,col2:bigint,col3:boolean,nested_col:struct<col1:string,col2:bigint>>',
        children: [
          'col1:string,',
          'col2:bigint,',
          'col3:boolean,',
          {
            head: 'nested_col:struct<',
            name: 'nested_col',
            col_type: 'struct<col1:string,col2:bigint>',
            children: ['col1:string,', 'col2:bigint'],
            tail: '>',
          },
        ],
        tail: '>',
      };

      expect(Parser.parseNestedType(columnType, 'delta')).toEqual(expected);
    });

    it('returns expected NestedType for array', () => {
      const columnType =
        'array_col:array<elem:struct<col1:string,col2:bigint,col3:boolean>>';
      const expected: Parser.NestedType = {
        head: 'array_col:array<',
        name: 'array_col',
        col_type: 'array<elem:struct<col1:string,col2:bigint,col3:boolean>>',
        children: [
          {
            head: 'elem:struct<',
            name: 'elem',
            col_type: 'struct<col1:string,col2:bigint,col3:boolean>',
            children: ['col1:string,', 'col2:bigint,', 'col3:boolean'],
            tail: '>',
          },
        ],
        tail: '>',
      };

      expect(Parser.parseNestedType(columnType, 'delta')).toEqual(expected);
    });
  });
});
