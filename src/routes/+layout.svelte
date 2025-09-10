<script>
	import '../app.css';
	import francepolLogo from '$lib/assets/francepol-logo.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={francepolLogo} />
	<title>FRANCEPOL - Transport Dashboard</title>
	<meta name="description" content="FRANCEPOL Transport Dashboard - Analiza finansowa kierowców" />
</svelte:head>

{@render children?.()}
