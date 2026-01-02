import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';
import { getDeviceId } from './lib/deviceId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';

type Item = Doc<'shoppingItems'>;

function App() {
  const deviceId = getDeviceId();
  const items = useQuery(api.shoppingItems.getItems, { deviceId });
  const addItem = useMutation(api.shoppingItems.addItem);
  const updateItem = useMutation(api.shoppingItems.updateItem);
  const toggleItem = useMutation(api.shoppingItems.toggleItem);
  const deleteItem = useMutation(api.shoppingItems.deleteItem);

  const isLoading = items === undefined;

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [editingId, setEditingId] = useState<Id<'shoppingItems'> | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    await addItem({
      deviceId,
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

  return (
    <div className="min-h-screen bg-neutral-950 p-4 flex flex-col">
      <div className="max-w-2xl mx-auto py-8 flex-1">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-slate-100">Shopping List</CardTitle>
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
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Add</Button>
            </form>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
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
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="hover:bg-slate-600 text-green-400">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit} className="hover:bg-slate-600 text-slate-400">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span
                            className={`${
                              item.checked ? 'line-through text-slate-500' : 'text-slate-100'
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
          </a>
          {' '}with data stored via{' '}
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
