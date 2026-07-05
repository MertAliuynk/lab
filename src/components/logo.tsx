import { getRoleName } from "@/lib/utils";

export default function Logo({ role }: { role: string }) {
	return (
		<div className="flex items-center gap-2">
			<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-foreground text-sidebar-primary-foreground">
				<div className="size-5">
					<svg viewBox="0 0 282 282" fill="none" xmlns="http://www.w3.org/2000/svg">
						<title>Protez Laboratuvarı</title>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M228.304 141C231.698 117.724 233.531 96.4812 233.531 83.7188C233.531 42.3492 214.265 8.8125 185.062 8.8125C171.109 8.8125 157.156 22.0312 143.203 22.0312C129.25 22.0312 115.297 8.8125 101.344 8.8125C72.1417 8.8125 52.875 42.3492 52.875 83.7188C52.875 96.4812 54.7086 117.724 58.102 141H228.304Z"
							className="fill-muted"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M105.75 141H180.656V171.844L167.438 189.469V255.562L143.203 273.188L118.969 255.562V189.469L105.75 171.844V141Z"
							className="fill-background"
						/>
						<path
							d="M110.156 26.4375C90.6882 26.4375 74.9062 42.2195 74.9062 61.6875"
							strokeWidth="25"
							strokeLinecap="round"
							className="fill-card-foreground"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M118.969 224.719L167.438 237.938V246.75L118.969 233.531V224.719Z"
							className="fill-card-foreground"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M118.969 207.094L167.438 220.312V229.125L118.969 215.906V207.094Z"
							className="fill-card-foreground"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M118.969 189.469L167.438 202.688V211.5L118.969 198.281V189.469Z"
							className="fill-card-foreground"
						/>
					</svg>
				</div>
			</div>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-semibold">Protez Laboratuvarı</span>
				<span className="truncate text-xs">{getRoleName(role)}</span>
			</div>
		</div>
	);
}
