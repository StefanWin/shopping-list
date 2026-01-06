import { useMutation, useQuery } from 'convex/react';
import { Check, Copy, Edit2, Loader2, Share2, Trash2, X, CheckCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { api } from '../convex/_generated/api';
import type { Doc, Id } from '../convex/_generated/dataModel';
import { getDeviceId } from './lib/deviceId';
import {
	clearShareToken,
	getActiveToken,
	getShareToken,
	setShareToken,
} from './lib/shareToken';

type Item = Doc<'shoppingItems'>;
type SortOption = 'default' | 'unchecked-first' | 'alphabetical';

function App() {
	const deviceId = getDeviceId();
	const activeToken = getActiveToken(deviceId);
	const items = useQuery(api.shoppingItems.getItems, { deviceId: activeToken });
	const addItem = useMutation(api.shoppingItems.addItem);
	const updateItem = useMutation(api.shoppingItems.updateItem);
	const toggleItem = useMutation(api.shoppingItems.toggleItem);
	const deleteItem = useMutation(api.shoppingItems.deleteItem);
	const deleteCheckedItems = useMutation(api.shoppingItems.deleteCheckedItems);

	const isLoading = items === undefined;

	const [newItemName, setNewItemName] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState('1');
	const [editingId, setEditingId] = useState<Id<'shoppingItems'> | null>(null);
	const [editName, setEditName] = useState('');
	const [editQuantity, setEditQuantity] = useState('');
	const [showShareModal, setShowShareModal] = useState(false);
	const [shareTokenInput, setShareTokenInput] = useState('');
	const [copySuccess, setCopySuccess] = useState(false);
	const [copyUrlSuccess, setCopyUrlSuccess] = useState(false);
	const [sortOption, setSortOption] = useState<SortOption>('default');

	// Handle share token from URL parameter
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const shareToken = params.get('share');
		if (shareToken) {
			setShareToken(shareToken);
			// Clean up URL without the share parameter
			window.history.replaceState({}, '', window.location.pathname);
		}
	}, []);

	const handleAddItem = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newItemName.trim()) return;

		await addItem({
			deviceId: activeToken,
			name: newItemName.trim(),
			quantity: parseInt(newItemQuantity) || 1,
		});

		setNewItemName('');
		setNewItemQuantity('1');
	};

	const startEdit = (item: Item) => {
		setEditingId(item._id);
		setEditName(item.name);
		setEditQuantity(item.quantity.toString());
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditName('');
		setEditQuantity('');
	};

	const saveEdit = async () => {
		if (!editingId || !editName.trim()) return;

		await updateItem({
			id: editingId,
			name: editName.trim(),
			quantity: parseInt(editQuantity) || 1,
		});

		cancelEdit();
	};

	const handleCopyToken = async () => {
		await navigator.clipboard.writeText(activeToken);
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 2000);
	};

	const handleCopyUrl = async () => {
		const shareUrl = `${window.location.origin}${window.location.pathname}?share=${activeToken}`;
		await navigator.clipboard.writeText(shareUrl);
		setCopyUrlSuccess(true);
		setTimeout(() => setCopyUrlSuccess(false), 2000);
	};

	const handleJoinList = () => {
		if (!shareTokenInput.trim()) return;
		setShareToken(shareTokenInput.trim());
		setShareTokenInput('');
		setShowShareModal(false);
		window.location.reload();
	};

	const handleUseOwnList = () => {
		clearShareToken();
		setShowShareModal(false);
		window.location.reload();
	};

	const isUsingSharedList = getShareToken() !== null;

	const sortedItems = useMemo(() => {
		if (!items) return [];

		const itemsCopy = [...items];

		switch (sortOption) {
			case 'unchecked-first':
				return itemsCopy.sort((a, b) => {
					if (a.checked === b.checked) return 0;
					return a.checked ? 1 : -1;
				});
			case 'alphabetical':
				return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
			default:
				return itemsCopy;
		}
	}, [items, sortOption]);

	const hasCheckedItems = items?.some((item) => item.checked) ?? false;

	const handleClearChecked = async () => {
		await deleteCheckedItems({ deviceId: activeToken });
	};

	return (
		<div className="min-h-screen bg-neutral-950 p-4 flex flex-col">
			<div className="max-w-2xl mx-auto py-8 flex-1">
				<Card className="bg-slate-800 border-slate-700">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-3xl font-bold text-slate-100">
								Shopping List
							</CardTitle>
							<Button
								onClick={() => setShowShareModal(true)}
								className="bg-red-600 hover:bg-red-700 text-white"
								size="sm"
							>
								<Share2 className="h-4 w-4 mr-2" />
								Share
							</Button>
						</div>
						{isUsingSharedList && (
							<div className="mt-2 text-sm text-yellow-400 text-center">
								You are viewing a shared list
							</div>
						)}
					</CardHeader>
					<CardContent>
						<form onSubmit={handleAddItem} className="flex gap-2 mb-6">
							<Input
								type="text"
								placeholder="Item name"
								value={newItemName}
								onChange={(e) => setNewItemName(e.target.value)}
								className="flex-1 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
							/>
							<Input
								type="number"
								placeholder="Qty"
								value={newItemQuantity}
								onChange={(e) => setNewItemQuantity(e.target.value)}
								className="w-20 bg-slate-700 border-slate-600 text-slate-100"
								min="1"
							/>
							<Button
								type="submit"
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								Add
							</Button>
						</form>

						{!isLoading && items.length > 0 && (
							<div className="space-y-2 mb-4">
								<select
									value={sortOption}
									onChange={(e) => setSortOption(e.target.value as SortOption)}
									className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md px-3 py-2 text-sm"
								>
									<option value="default">Sort: Default</option>
									<option value="unchecked-first">Sort: Unchecked First</option>
									<option value="alphabetical">Sort: A-Z</option>
								</select>
									<Button
										disabled={!hasCheckedItems}
										onClick={handleClearChecked}
										variant="outline"
										className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
									>
										<CheckCheck className="h-4 w-4 mr-2" />
										Clear Completed
									</Button>
							</div>
						)}

						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-red-500" />
							</div>
						) : (
							<div className="space-y-2">
								{sortedItems.map((item) => (
									<div
										key={item._id}
										className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg border border-slate-600 hover:bg-slate-650 transition-colors"
									>
										<Checkbox
											checked={item.checked}
											onCheckedChange={(checked) =>
												toggleItem({ id: item._id, checked: !!checked })
											}
										/>

										{editingId === item._id ? (
											<>
												<Input
													type="text"
													value={editName}
													onChange={(e) => setEditName(e.target.value)}
													className="flex-1 bg-slate-600 border-slate-500 text-slate-100"
													autoFocus
												/>
												<Input
													type="number"
													value={editQuantity}
													onChange={(e) => setEditQuantity(e.target.value)}
													className="w-20 bg-slate-600 border-slate-500 text-slate-100"
													min="1"
												/>
												<Button
													size="icon"
													variant="ghost"
													onClick={saveEdit}
													className="hover:bg-slate-600 text-green-400"
												>
													<Check className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={cancelEdit}
													className="hover:bg-slate-600 text-slate-400"
												>
													<X className="h-4 w-4" />
												</Button>
											</>
										) : (
											<>
												<div className="flex-1">
													<span
														className={`${
															item.checked
																? 'line-through text-slate-500'
																: 'text-slate-100'
														}`}
													>
														{item.name}
													</span>
													<span className="ml-2 text-sm text-slate-400">
														x{item.quantity}
													</span>
												</div>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => startEdit(item)}
													className="hover:bg-slate-600 text-slate-300"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => deleteItem({ id: item._id })}
													className="hover:bg-slate-600"
												>
													<Trash2 className="h-4 w-4 text-red-400" />
												</Button>
											</>
										)}
									</div>
								))}

								{items.length === 0 && (
									<p className="text-center text-slate-500 py-8">
										Your shopping list is empty. Add some items!
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{showShareModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="bg-slate-800 border-slate-700 w-full max-w-md">
							<CardHeader>
								<CardTitle className="text-2xl font-bold text-slate-100">
									Share Your List
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h3 className="text-sm font-medium text-slate-300 mb-2">
										Share via URL
									</h3>
									<p className="text-xs text-slate-400 mb-3">
										Copy and share this link. Anyone who opens it can view and edit your list.
									</p>
									<div className="flex gap-2 mb-4">
										<Input
											value={`${window.location.origin}${window.location.pathname}?share=${activeToken}`}
											readOnly
											className="flex-1 bg-slate-700 border-slate-600 text-slate-100 text-xs"
										/>
										<Button
											onClick={handleCopyUrl}
											className="bg-red-600 hover:bg-red-700 text-white"
										>
											<Copy className="h-4 w-4 mr-2" />
											{copyUrlSuccess ? 'Copied!' : 'Copy'}
										</Button>
									</div>
								</div>

								<div className="border-t border-slate-700 pt-4">
									<h3 className="text-sm font-medium text-slate-300 mb-2">
										Share via Token
									</h3>
									<p className="text-xs text-slate-400 mb-3">
										Copy this token and share it manually. Others can paste it below.
									</p>
									<div className="flex gap-2">
										<Input
											value={activeToken}
											readOnly
											className="flex-1 bg-slate-700 border-slate-600 text-slate-100 font-mono text-sm"
										/>
										<Button
											onClick={handleCopyToken}
											className="bg-red-600 hover:bg-red-700 text-white"
										>
											<Copy className="h-4 w-4 mr-2" />
											{copySuccess ? 'Copied!' : 'Copy'}
										</Button>
									</div>
								</div>

								<div className="border-t border-slate-700 pt-4">
									<h3 className="text-sm font-medium text-slate-300 mb-2">
										Join someone else's list
									</h3>
									<p className="text-xs text-slate-400 mb-3">
										Enter a share token to view and edit someone else's list.
									</p>
									<div className="flex gap-2">
										<Input
											placeholder="Enter share token"
											value={shareTokenInput}
											onChange={(e) => setShareTokenInput(e.target.value)}
											className="flex-1 bg-slate-700 border-slate-600 text-slate-100"
										/>
										<Button
											onClick={handleJoinList}
											className="bg-red-600 hover:bg-red-700 text-white"
										>
											Join
										</Button>
									</div>
								</div>

								{isUsingSharedList && (
									<div className="border-t border-slate-700 pt-4">
										<Button
											onClick={handleUseOwnList}
											variant="outline"
											className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
										>
											Return to Your Own List
										</Button>
									</div>
								)}

								<div className="flex justify-end pt-2">
									<Button
										onClick={() => setShowShareModal(false)}
										variant="ghost"
										className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
									>
										Close
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>

			<footer className="text-center py-4 text-slate-400 text-sm space-y-2">
				<div>
					Made by{' '}
					<a
						href="https://swinte.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="text-red-400 hover:text-red-300 underline"
					>
						swinte.dev
					</a>{' '}
					·{' '}
					<a
						href="https://github.com/StefanWin/shopping-list"
						target="_blank"
						rel="noopener noreferrer"
						className="text-red-400 hover:text-red-300 underline"
					>
						GitHub
					</a>
				</div>
				<div className="text-xs text-slate-500">
					Hosted on{' '}
					<a
						href="https://vercel.com"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-400 underline"
					>
						Vercel
					</a>{' '}
					with data stored via{' '}
					<a
						href="https://convex.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-400 underline"
					>
						Convex
					</a>
					. Your shopping list is private to your browser.
				</div>
			</footer>
		</div>
	);
}

export default App;
