import torch
import torch.nn as nn
import torch.optim as optim
import json
import numpy as np
import os
import pickle
from collections import Counter

# Set random seed for reproducibility
torch.manual_seed(42)

class COSECSchemaPredictor(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim):
        super(COSECSchemaPredictor, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers=2, batch_first=True, bidirectional=True, dropout=0.3)
        self.fc = nn.Linear(hidden_dim * 2, output_dim)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        embedded = self.embedding(x)
        # lstm_out: [batch, seq_len, hidden_dim * 2]
        lstm_out, _ = self.lstm(embedded)
        # Use the last hidden state of the Bi-LSTM (concatenated)
        # For simplicity, we can take the mean or max over the sequence
        out = torch.mean(lstm_out, dim=1)
        out = self.fc(out)
        return self.sigmoid(out)

def train_model():
    # 1. Load Data
    data_dir = os.path.join(os.path.dirname(__file__), '../data')
    data_files = ['master_expansion_1200.jsonl', 'mixed_genre_100.jsonl', 'universal_diversity_data.jsonl', 'lstm_training_data.jsonl', 'manual_training_data.jsonl', 'comprehensive_training_data.jsonl', 'join_training_data.jsonl', 'complex_join_data_500.jsonl', 'mixed_data_200.jsonl']
    data_files = [os.path.join(data_dir, df) for df in data_files]
    prompts = []
    targets = []
    all_labels = set()
    
    for df in data_files:
        if not os.path.exists(df):
            continue
        with open(df, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    item = json.loads(line)
                    prompts.append(item['input'].lower())
                    targets.append(item['target'])
                    for t in item['target']:
                        all_labels.add(t)
                except:
                    continue

    if not prompts:
        print("Error: No training data found.")
        return
    
    print(f"Loaded {len(prompts)} samples across {len(all_labels)} labels.")

    label_list = sorted(list(all_labels))
    label_to_idx = {l: i for i, l in enumerate(label_list)}
    idx_to_label = {i: l for i, l in enumerate(label_list)}

    # 2. Build Vocabulary
    words = []
    for p in prompts:
        words.extend(p.split())
    
    word_counts = Counter(words)
    vocab = ["<PAD>", "<UNK>"] + [w for w, c in word_counts.items() if c >= 1]
    word_to_idx = {w: i for i, w in enumerate(vocab)}

    # 3. Preprocess
    max_len = 20
    X = []
    for p in prompts:
        seq = [word_to_idx.get(w, word_to_idx["<UNK>"]) for w in p.split()]
        if len(seq) < max_len:
            seq += [word_to_idx["<PAD>"]] * (max_len - len(seq))
        else:
            seq = seq[:max_len]
        X.append(seq)

    Y = []
    for t in targets:
        vec = np.zeros(len(label_list), dtype=np.float32)
        for label in t:
            vec[label_to_idx[label]] = 1.0
        Y.append(vec)

    X = torch.tensor(X, dtype=torch.long)
    Y = torch.tensor(np.array(Y), dtype=torch.float32)

    # 4. Model Setup
    model = COSECSchemaPredictor(
        vocab_size=len(vocab),
        embedding_dim=64,
        hidden_dim=128,
        output_dim=len(label_list)
    )
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 5. Training Loop
    print("Starting training...")
    epochs = 2000
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X)
        loss = criterion(outputs, Y)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 20 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}")

    # 6. Save Model and Metadata
    torch.save(model.state_dict(), 'cosec_router.pth')
    metadata = {
        "word_to_idx": word_to_idx,
        "idx_to_label": idx_to_label,
        "max_len": max_len,
        "label_list": label_list,
        "vocab_size": len(vocab),
        "embedding_dim": 64,
        "hidden_dim": 128,
        "output_dim": len(label_list)
    }
    with open('model_metadata.pkl', 'wb') as f:
        pickle.dump(metadata, f)
    
    print("Model and metadata saved.")

if __name__ == "__main__":
    train_model()
