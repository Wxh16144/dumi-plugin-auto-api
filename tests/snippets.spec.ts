import { remark } from 'remark';
import { VFile } from 'vfile';

import { remarkPlugin as core } from '../src/core';

describe('snippet', () => {
  const generateFile = (content: string) =>
    new VFile({
      value: content.trim(),
      data: {
        frontmatter: {
          filename: './tests/__fixtures__/index.md',
        },
      },
      basename: 'index.md',
      extname: '.md',
    }) as unknown as string;

  it('基础功能', () => {
    expect(remark().use(core, {}).processSync(generateFile('Hello')).toString())
      .toMatchInlineSnapshot(`
        "Hello
        "
      `);
  });
});
