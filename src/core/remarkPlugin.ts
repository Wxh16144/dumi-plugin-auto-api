import { /* defineConfig, */ unistUtilVisit } from 'dumi';
import enhancedResolve from 'enhanced-resolve';
import fs from 'fs-extra';
import path from 'path';
import type { Node, Parent } from 'unist';
import { rawPathToToken } from './utils';

const CH = '<'.charCodeAt(0);

// type IDumiUserConfig = ReturnType<typeof defineConfig>;

export interface IProps {
  cwd?: string;
  alias?: Record<string, string>;
}

function remarkPlugin(opt: IProps) {
  const { cwd = process.cwd(), alias = {} } = opt;

  return (tree: any, vFile: any) => {
    const codeSnippets: [Node, number, Parent | undefined][] = [];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _self: any = this;

    unistUtilVisit.visit(tree, 'paragraph', (node, index, parent) => {
      if (!Array.isArray(node.children) && node.children.length > 1) {
        return unistUtilVisit.SKIP;
      }

      const [child] = node.children;

      if (child.type !== 'text') {
        return unistUtilVisit.SKIP;
      }

      const { value } = child;
      const isValidPrefix = value
        .slice(0, 3)
        .split('')
        .every((char: string) => {
          return char.charCodeAt(0) === CH;
        });

      if (!isValidPrefix) {
        return unistUtilVisit.SKIP;
      }

      codeSnippets.push([node, index!, parent]);
    });

    for (const [node /* index, parent */] of codeSnippets) {
      const cloneNode: any = { ...node };
      let rawPath = cloneNode.children[0].value.slice(3).trim();

      const { filepath, extension } = rawPathToToken(rawPath);

      // ref: https://github.com/umijs/dumi/pull/1901
      const currentFileAbsPath = (function () {
        if (_self.data?.('fileAbsPath')) return _self.data('fileAbsPath');

        const __fm_path = vFile?.data?.frontmatter?.filename;

        return path.join(cwd, __fm_path || '');
      })();

      let src: string = path.isAbsolute(filepath)
        ? filepath
        : path.join(path.dirname(currentFileAbsPath), filepath);

      try {
        const result = enhancedResolve.create.sync({
          alias,
          extensions: [extension].filter(Boolean) as string[],
        })(path.dirname(currentFileAbsPath), filepath) as string;

        if (result) src = result;
      } catch (error) {
        /* ignore */
      }

      let content: string = '';

      const srcStats = fs.existsSync(src) && fs.lstatSync(src);
      const isAFile = srcStats && (srcStats.isFile() || srcStats.isSymbolicLink());

      if (!isAFile) {
        content = isAFile
          ? `Invalid code snippet option`
          : `Code snippet path not found: ${path.relative(path.dirname(currentFileAbsPath), src)}`;
      } else {
        content = fs.readFileSync(src, 'utf8');
      }

      console.log('content', content);
    }
  };
}

export default remarkPlugin;
