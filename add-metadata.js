const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app');

function toTitleCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  if (items.includes('page.tsx')) {
    const layoutPath = path.join(dir, 'layout.tsx');
    if (!fs.existsSync(layoutPath)) {
      // It's a page that needs a layout.tsx for metadata
      const relativePath = path.relative(baseDir, dir).replace(/\\/g, '/');
      if (relativePath !== '') {
        const title = toTitleCase(path.basename(dir));
        const desc = `Use FileConvert to process your ${title} files easily and securely.`;
        
        const content = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title} | FileConvert',
  description: '${desc}',
  openGraph: {
    title: '${title} | FileConvert',
    description: '${desc}',
    url: 'https://fileconvert.example.com/${relativePath}',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: '${title} | FileConvert', description: '${desc}' },
  alternates: { canonical: 'https://fileconvert.example.com/${relativePath}' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
        fs.writeFileSync(layoutPath, content, 'utf8');
        console.log(`Created ${layoutPath}`);
      }
    }
  }

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    }
  });
}

processDirectory(baseDir);
