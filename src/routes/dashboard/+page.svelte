<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 5000);

		return () => clearInterval(interval);
	});
</script>

<div class="mx-auto max-w-2xl p-6">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Hi, {data.user.name}!</h1>
		<form method="POST" action="?/signOut" use:enhance>
			<button
				class="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-300"
			>
				Sign out
			</button>
		</form>
	</div>

	{#if page.form?.addError}
		<p class="mb-4 text-sm text-red-600">{page.form.addError}</p>
	{/if}

	{#if page.form?.removeError}
		<p class="mb-4 text-sm text-red-600">{page.form.removeError}</p>
	{/if}

	<h2 class="mb-4 text-lg font-semibold">Active Signs</h2>

	{#if data.devices.length === 0}
		<div class="flex items-center gap-2 text-sm text-gray-500">
			<span class="inline-block h-3 w-3 rounded-full bg-gray-400"></span>
			<span>No devices connected.</span>
		</div>
	{:else}
		<div class="space-y-6">
			{#each data.devices as device (device)}
				<div class="rounded-lg border border-gray-200 p-4">
					<div class="mb-3 flex items-center gap-2">
						<span class="inline-block h-3 w-3 rounded-full bg-green-500"></span>
						<h3 class="text-md font-semibold">{device}</h3>
					</div>

					{#if (data.deviceNetworks[device] ?? []).length > 0}
						<ul class="mb-4 space-y-2">
							{#each data.deviceNetworks[device] as network, i (i)}
								<li class="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
									<div>
										<span class="font-medium">{network.ssid}</span>
										<span class="ml-2 text-sm text-gray-500">{network.network_type}</span>
									</div>
									<form method="POST" action="?/removeNetwork" use:enhance>
										<input type="hidden" name="device" value={device} />
										<input type="hidden" name="index" value={i} />
										<button class="text-sm text-red-600 hover:text-red-800">Remove</button>
									</form>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="mb-4 text-sm text-gray-500">No networks configured.</p>
					{/if}

					<details class="group">
						<summary class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
							Add Network
						</summary>
						<form method="POST" action="?/addNetwork" use:enhance class="mt-3 space-y-3">
							<input type="hidden" name="device" value={device} />
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label for="ssid-{device}" class="mb-1 block text-sm font-medium">SSID</label>
									<input
										id="ssid-{device}"
										name="ssid"
										type="text"
										required
										class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
									/>
								</div>
								<div>
									<label for="password-{device}" class="mb-1 block text-sm font-medium">Password</label>
									<input
										id="password-{device}"
										name="password"
										type="password"
										class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
									/>
								</div>
							</div>
							<div class="flex items-end gap-3">
								<div class="flex-1">
									<label for="type-{device}" class="mb-1 block text-sm font-medium">Type</label>
									<select
										id="type-{device}"
										name="network_type"
										class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
									>
										<option value="personal">Personal</option>
										<option value="enterprise">Enterprise</option>
									</select>
								</div>
								<button
									class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
								>
									Add
								</button>
							</div>
						</form>
					</details>
				</div>
			{/each}
		</div>
	{/if}
</div>
