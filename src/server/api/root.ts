import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { userRouter } from "./routers/admin/user";
import { dentistRouter } from "./routers/dentist";
import { laboratoryTechnicianRouter } from "./routers/laboratory-technician";
import { notificationsRouter } from "./routers/notifications";
import { smsRouter } from "./routers/sms";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
	admin: adminRouter,
	dentist: dentistRouter,
	laboratoryTechnician: laboratoryTechnicianRouter,
	notifications: notificationsRouter,
	user: userRouter,
	sms: smsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
