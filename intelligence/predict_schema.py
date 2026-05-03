import torch
import torch.nn as nn
import json
import sys
import pickle
import os

# Redefine model architecture for loading
class COSECSchemaPredictor(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim):
        super(COSECSchemaPredictor, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers=2, batch_first=True, bidirectional=True, dropout=0.3)
        self.fc = nn.Linear(hidden_dim * 2, output_dim)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        embedded = self.embedding(x)
        lstm_out, _ = self.lstm(embedded)
        out = torch.mean(lstm_out, dim=1)
        out = self.fc(out)
        return self.sigmoid(out)

def predict(prompt):
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, 'cosec_router.pth')
    meta_path = os.path.join(base_path, 'model_metadata.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(meta_path):
        return []

    # Load Metadata
    with open(meta_path, 'rb') as f:
        meta = pickle.load(f)
    
    word_to_idx = meta['word_to_idx']
    idx_to_label = meta['idx_to_label']
    max_len = meta['max_len']

    # Load Model
    model = COSECSchemaPredictor(
        vocab_size=meta['vocab_size'],
        embedding_dim=meta['embedding_dim'],
        hidden_dim=meta['hidden_dim'],
        output_dim=meta['output_dim']
    )
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()

    # Preprocess Input
    tokens = prompt.lower().split()
    seq = [word_to_idx.get(w, word_to_idx["<UNK>"]) for w in tokens]
    if len(seq) < max_len:
        seq += [word_to_idx["<PAD>"]] * (max_len - len(seq))
    else:
        seq = seq[:max_len]
    
    X = torch.tensor([seq], dtype=torch.long)

    # Inference
    with torch.no_grad():
        probs = model(X).squeeze().tolist()
    
    # Handle single output case
    if not isinstance(probs, list):
        probs = [probs]

    # Filter by threshold 0.01 for absolute multi-join coverage
    results = []
    for i, p in enumerate(probs):
        if p >= 0.01:
            results.append(idx_to_label[i])
    
    # Debug Mode
    if os.getenv("DEBUG") == "1":
        # Sort by probability and show top 10
        debug_items = sorted([(idx_to_label[i], p) for i, p in enumerate(probs)], key=lambda x: x[1], reverse=True)
        debug_info = {k: v for k, v in debug_items[:10] if v > 0.001}
        print(f"DEBUG_PROBS: {json.dumps(debug_info)}", file=sys.stderr)

    return results

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        predictions = predict(query)
        # Always output valid JSON
        print(json.dumps(predictions))
    else:
        print(json.dumps([]))
