import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { imageSearch } from '@mudbill/duckduckgo-images-api';
import { DuckDuckGoImage } from '@mudbill/duckduckgo-images-api/dist/@types/src/api';
import wikipedia from 'wikipedia';

interface WikiPageSummary {
    extract: string
};
interface WikiSearchResult {
    results: { title: string }[]
};

const app = express();
const PORT = 3001;

const imageDir = path.resolve(
    path.dirname(path.dirname(__filename)),
    'saved-images'
);

app.use(cors());
app.use(express.static(imageDir));

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, imageDir);
        },
        filename: (_req, file, cb) => {
            cb(null, file.originalname);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

app.get('/api/ddgImages', async (req, res) => {
    const query = req.query.query as string;
    const category = req.query.category as string;

    if (!query) {
        res.status(400).json({
            error: 'Missing query',
        });
        return;
    }

    try {
        const results = await imageSearch({
            query: `${query} ${category}`,
            safe: true,
        });

        res.json(
            results.slice(0, 24).map((result: DuckDuckGoImage) => ({
                image: result.image,
                thumbnail: result.thumbnail,
                title: result.title,
            }))
        );
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to fetch images',
        });
    }
});

app.get('/api/wikiSummary', async (req, res) => {
    const title = req.query.title as string;
    const category = req.query.category as string;

    if (!title) {
        return res.status(400).json({ error: 'Missing query' });
    }

    try {
        const fetchNonAmbiguousSummary = async (pageTitle: string): Promise<string> => {
            const page = await wikipedia.page(pageTitle);
            let summary: WikiPageSummary = await page.summary();

            let attempts = 0;
            while (summary.extract.includes('may refer to:') && attempts < 3) {
                const searchResults: WikiSearchResult = await wikipedia.search(`${pageTitle} ${category}`);
                if (searchResults.results.length <= attempts) break;

                const nextPage = await wikipedia.page(searchResults.results[attempts].title);
                summary = await nextPage.summary();
                attempts++;
            }

            return summary.extract;
        };

        const finalSummary = await fetchNonAmbiguousSummary(title);

        if (!finalSummary) {
            return res.status(404).json({ error: 'No relevant summary found' });
        }

        res.json({ summary: finalSummary });

    } catch (err: unknown) {
        console.error(err);

        if (
            err instanceof Error &&
            err.message.includes('Page not found')
        ) {
            return res.status(404).json({
                error: 'Page not found',
            });
        }

        return res.status(500).json({
            error: 'Failed to fetch summary',
        });
    }
});

app.get('/api/localImages', async (_req, res) => {
    try {
        const files = await fs.readdir(imageDir);

        const images = files
            .filter(file =>
                /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
            .map(file => path.parse(file).name);

        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to read image directory' });
    }
});

app.post('/api/localImages', upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' });
        return;
    }

    res.status(201).json({
        filename: req.file.filename,
        url: `/images/${req.file.filename}`,
    });
});

app.delete('/api/localImages/:filename', async (req, res) => {
    const { filename } = req.params;

    if (!filename || !/^[a-zA-Z0-9_-]+$/.test(filename)) {
        return res.status(400).json({
            error: 'Invalid filename',
        });
    }

    const filePath = path.join(imageDir, `${filename}.png`);

    try {
        await fs.unlink(filePath);
        return res.status(204).send();
    } catch (error: unknown) {
        console.error(error);

        if (
            error instanceof Error &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            return res.status(404).json({
                error: 'Image not found',
            });
        }

        return res.status(500).json({
            error: 'Failed to delete image',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
