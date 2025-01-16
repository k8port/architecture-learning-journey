// create-post.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TEMPLATE_DIR = path.join('blog-posts', 'templates');
const DRAFTS_DIR = path.join('blog-posts', 'drafts');

// Ensure directories exist
[TEMPLATE_DIR, DRAFTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const templateTypes = {
  1: 'technical-deep-dive.md',
  2: 'tutorial.md',
  3: 'case-study.md'
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const promptUser = async () => {
  const questions = {
    templateType: 'Select template type:\n1. Technical Deep Dive\n2. Tutorial\n3. Case Study\nEnter number: ',
    title: 'Enter post title: ',
    tags: 'Enter tags (comma-separated): ',
    summary: 'Enter brief summary: '
  };

  const answers = {};
  
  for (const [key, question] of Object.entries(questions)) {
    answers[key] = await new Promise(resolve => rl.question(question, resolve));
  }
  
  return answers;
};

const createPost = async () => {
  try {
    const answers = await promptUser();
    
    // Validate template selection
    if (!templateTypes[answers.templateType]) {
      console.error('Invalid template type selected');
      process.exit(1);
    }

    // Read template
    const templatePath = path.join(TEMPLATE_DIR, templateTypes[answers.templateType]);
    let template = fs.readFileSync(templatePath, 'utf8');

    // Create filename
    const date = getTodayDate();
    const slug = slugify(answers.title);
    const fileName = `${date}-${slug}.md`;
    const filePath = path.join(DRAFTS_DIR, fileName);

    // Replace template placeholders
    template = template
      .replace('title: "Title of Your', `title: "${answers.title}`)
      .replace('date: YYYY-MM-DD', `date: ${date}`)
      .replace('tags: ["architecture", "cloud", "distributed-systems"]', `tags: [${answers.tags.split(',').map(tag => `"${tag.trim()}"`)}]`)
      .replace('summary: "A brief one-paragraph summary', `summary: "${answers.summary}`);

    // Write new post
    fs.writeFileSync(filePath, template);
    
    console.log(`\nSuccess! Created new blog post: ${filePath}`);
    console.log('\nNext steps:');
    console.log('1. Open the file in your editor');
    console.log('2. Fill in the content following the template structure');
    console.log('3. Move to published/ directory when ready');

  } catch (error) {
    console.error('Error creating blog post:', error);
  } finally {
    rl.close();
  }
};

// Run the script
createPost();