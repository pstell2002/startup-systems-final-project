import {pgTable, serial, text, integer, real, timestamp,} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from "./auth"; 
  
  export const movies = pgTable('movies', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    releaseYear: integer('release_year'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  
  export const genres = pgTable('genres', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
  });
  
  export const movieGenres = pgTable('movie_genres', {
    movieId: integer('movie_id').references(() => movies.id).notNull(),
    genreId: integer('genre_id').references(() => genres.id).notNull(),
  });
  
  export const ratings = pgTable('ratings', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => users.id).notNull(),
    movieId: integer('movie_id').references(() => movies.id).notNull(),
    rating: real('rating').notNull(),
    review: text('review'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  
  // Relations
  export const moviesRelations = relations(movies, ({ many }) => ({
    ratings: many(ratings),
    movieGenres: many(movieGenres),
  }));
  
  export const genresRelations = relations(genres, ({ many }) => ({
    movieGenres: many(movieGenres),
  }));
  
  export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
    movie: one(movies, {
      fields: [movieGenres.movieId],
      references: [movies.id],
    }),
    genre: one(genres, {
      fields: [movieGenres.genreId],
      references: [genres.id],
    }),
  }));
  
  export const ratingsRelations = relations(ratings, ({ one }) => ({
    user: one(users, {
      fields: [ratings.userId],
      references: [users.id],
    }),
    movie: one(movies, {
      fields: [ratings.movieId],
      references: [movies.id],
    }),
  }));

  import { createSchemaFactory } from 'drizzle-zod';
  import { z } from 'zod';
  
  const { createInsertSchema, createSelectSchema } = createSchemaFactory({
    coerce: { number: true, date: true },
  });
  
  const generatedFields = { id: true, createdAt: true } as const;
  
  export const movieInsertSchema = createInsertSchema(movies).omit(generatedFields);
  export const ratingInsertSchema = createInsertSchema(ratings).omit(generatedFields);
  export const genreInsertSchema = createInsertSchema(genres).omit({ id: true });
  
  export const paramsIDSchema = z.object({ id: z.coerce.number() });
  
  export type MovieInsert = z.infer<typeof movieInsertSchema>;
  export type RatingInsert = z.infer<typeof ratingInsertSchema>;
  export type GenreInsert = z.infer<typeof genreInsertSchema>;
  