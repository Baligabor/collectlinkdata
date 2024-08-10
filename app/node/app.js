import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const linksPath = './datas/links.json';
const filePath = '../../datas/datas.json';

const app = express();

const secret = crypto.randomBytes(64).toString('hex');

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../../')));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ username: req.user.username || req.user.displayName || 'User' });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
  });
  
app.post('/api/addData', async (req, res) => {
    const newData = req.body;
    try {
        let data = await fs.readFile(linksPath, 'utf8');
        let linksData = JSON.parse(data);
        linksData.push(newData);
        const json = JSON.stringify(linksData, null, 2);
        await fs.writeFile(linksPath, json, 'utf8');
        //await generateDataJson(linksData)
        await addDataJson(newData)
        res.status(200).json({ message: 'Data added successfully' });
    } catch (error) {
        console.error('Error writing JSON file:', error);
        res.status(500).json({ error: 'Failed to write data' });
    }
});
app.post('/api/deleteData', async (req, res) => {
    let linksData = req.body;
    try {
        //let linksData = JSON.parse(data);
        const json = JSON.stringify(linksData, null, 2);
        await fs.writeFile(linksPath, json, 'utf8');
        await generateDataJson(linksData)
        res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error writing JSON file:', error);
        res.status(500).json({ error: 'Failed to write data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});

async function generateDataJson(jsonData) {
    const datas = [];
    if (jsonData) {
        for (const item of jsonData) {
            if (item.link) {
                try {
                    let linkData = await getLinkDatas(item.link);
                    if (linkData) {
                        if (item.title) {
                            linkData.title = item.title;
                        }
                        if (item.description) {
                            linkData.description = item.description;
                        }
                        if (item.date) {
                            linkData.date = item.date;
                        }
                        if (item.author) {
                            linkData.author = item.author;
                        }
                        if (item.category) {
                            linkData.category = item.category;
                        }
                        if (item.type) {
                            linkData.type = item.type;
                        }
                        datas.push(linkData);
                    }
                    
                } catch (error) {
                    console.error('Error fetching link data:', error);
                }
            }
        };
    } else {
        console.error('Invalid JSON data');
    }
    await writeJsonFile(datas);
}
async function addDataJson(jsonData) {
    let data = await fs.readFile(filePath, 'utf8');
    let fileDatas = JSON.parse(data);    
    if (jsonData && jsonData.link) { 
        try {
            let linkData = await getLinkDatas(jsonData.link);
            if (linkData) {
                if (jsonData.title) {
                    linkData.title = jsonData.title;
                }
                if (jsonData.description) {
                    linkData.description = jsonData.description;
                }
                if (jsonData.date) {
                    linkData.date = jsonData.date;
                }
                if (jsonData.author) {
                    linkData.author = jsonData.author;
                }
                if (jsonData.category) {
                    linkData.category = jsonData.category;
                }
                if (jsonData.type) {
                    linkData.type = jsonData.type;
                }
                fileDatas.push(linkData);
                const json = JSON.stringify(fileDatas, null, 2);
                await fs.writeFile(filePath, json, 'utf8');
            }
            
        } catch (error) {
            console.error('Error fetching link data:', error);
        }
    } else {
        console.error('Invalid JSON data');
    }
}

async function getLinkDatas(link) {
    let data = {};
    try {
        const url = link;
        const response = await fetch(url);
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('title').text();
        const metaDescription = $('meta[name="description"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        
        data = {
            link: link,
            title: title,
            description: metaDescription,
            ogimage: ogImage
        };
    } catch(err) {
        return null;
    }
  
    return data;
}

async function writeJsonFile(data) {
    try {
        const absolutePath = path.resolve(filePath);
        const json = JSON.stringify(data, null, 2);
        await fs.writeFile(absolutePath, json, 'utf8');
        // console.log('File successfully written to', absolutePath);
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
  }

