// 通过 GitHub REST API（走 gh CLI）提交并推送，不依赖本机 git，也不走 git 协议端口。
// 用法：npm run push -- "这次改了什么"（引号里的说明可省略）
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'sll521000/personal-website';
const BRANCH = 'main';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const message = process.argv[2] || '更新网站';

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.astro', '.git']);

function gh(args, input) {
  return JSON.parse(
    execSync(`gh api ${args}${input ? ' --input -' : ''}`, {
      encoding: 'utf8',
      maxBuffer: 128 * 1024 * 1024,
      input,
    }),
  );
}

// 收集本地文件（相对路径，正斜杠）
function walk(rel = '', out = []) {
  for (const name of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    if (IGNORE_DIRS.has(name.name)) continue;
    const child = path.join(rel, name.name).replaceAll('\\', '/');
    if (name.isDirectory()) walk(child, out);
    else out.push(child);
  }
  return out;
}

// 计算文件内容的 git blob sha（和 GitHub 上一致），有变化的文件才需要新建 blob
function blobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

console.log('正在收集文件…');
const localFiles = walk();

// 当前远端分支状态（空仓库时没有分支，需要先初始化）
function getRef() {
  try {
    return gh(`repos/${REPO}/git/ref/heads/${BRANCH}`).object.sha;
  } catch {
    return null;
  }
}

let baseCommit = getRef();
if (!baseCommit) {
  // 空仓库不能用 Git Data API（GitHub 限制），先用 Contents API 建一个提交初始化
  console.log('仓库是空的，正在初始化…');
  const readme = fs.readFileSync(path.join(dir, 'README.md'));
  gh('-X PUT repos/' + REPO + '/contents/README.md', JSON.stringify({
    message: '初始化仓库',
    content: readme.toString('base64'),
  }));
  baseCommit = getRef();
}

const prevEntries = new Map();
let baseTreeSha = null;
if (baseCommit) {
  const commit = gh(`repos/${REPO}/git/commits/${baseCommit}`);
  baseTreeSha = commit.tree.sha;
  const tree = gh(`repos/${REPO}/git/trees/${baseTreeSha}?recursive=1`);
  for (const e of tree.tree) if (e.type === 'blob') prevEntries.set(e.path, e.sha);
}

// 只为有变化的文件创建 blob
const entries = [];
let uploaded = 0;
for (const file of localFiles) {
  const content = fs.readFileSync(path.join(dir, file));
  const sha = blobSha(content);
  if (prevEntries.get(file) !== sha) {
    const blob = gh('repos/' + REPO + '/git/blobs', JSON.stringify({
      content: content.toString('base64'),
      encoding: 'base64',
    }));
    uploaded++;
    entries.push({ path: file, mode: '100644', type: 'blob', sha: blob.sha });
  } else {
    entries.push({ path: file, mode: '100644', type: 'blob', sha });
  }
}

// 本地已删除的文件，在树里置空删除
for (const p of prevEntries.keys()) {
  if (!localFiles.includes(p)) entries.push({ path: p, mode: '100644', type: 'blob', sha: null });
}

console.log(`本地共 ${localFiles.length} 个文件，需上传 ${uploaded} 个变更`);

const treeBody = { tree: entries };
if (baseTreeSha) treeBody.base_tree = baseTreeSha;
const newTree = gh(`repos/${REPO}/git/trees`, JSON.stringify(treeBody));

const commitBody = { message, tree: newTree.sha };
if (baseCommit) commitBody.parents = [baseCommit];
const newCommit = gh(`repos/${REPO}/git/commits`, JSON.stringify(commitBody));

if (baseCommit) {
  gh(`-X PATCH repos/${REPO}/git/refs/heads/${BRANCH}`, JSON.stringify({
    sha: newCommit.sha,
    force: true,
  }));
} else {
  gh(`-X POST repos/${REPO}/git/refs`, JSON.stringify({
    ref: `refs/heads/${BRANCH}`,
    sha: newCommit.sha,
  }));
}

console.log(`已提交并推送到 GitHub：${newCommit.sha.slice(0, 7)} ${message}`);
console.log('GitHub 正在自动构建并发布，1 分钟左右后访问：');
console.log(`https://${REPO.split('/')[0]}.github.io/${REPO.split('/')[1]}/`);
