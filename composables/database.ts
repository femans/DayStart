import type { Tables } from '~~/types/database.types';
type Plan = Tables<'plans'>;

export const usePlans = () => useState<Plan[]>('plans');

