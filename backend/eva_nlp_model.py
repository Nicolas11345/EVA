import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchtext import data
from torchtext import datasets
import numpy as np
import random
import spacy
import os
import sys

class CNN(nn.Module):
    def __init__(self, vocab_size, embedding_dim, n_filters, filter_sizes, output_dim,
                 dropout):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.convs = nn.ModuleList([
            nn.Conv2d(in_channels=1,
                      out_channels=n_filters,
                      kernel_size=(fs, embedding_dim))
            for fs in filter_sizes
        ])
        self.fc = nn.Linear(len(filter_sizes) * n_filters, output_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, text):
        text = text.permute(1, 0)
        embedded = self.embedding(text)
        embedded = embedded.unsqueeze(1)
        conved = [F.relu(conv(embedded)).squeeze(3) for conv in self.convs]
        pooled = [F.max_pool1d(conv, conv.shape[2]).squeeze(2) for conv in conved]
        cat = self.dropout(torch.cat(pooled, dim=1))

        return self.fc(cat)

def categorical_accuracy(preds, y):
    max_preds = preds.argmax(dim = 1, keepdim = True)
    correct = max_preds.squeeze(1).eq(y)
    return correct.sum() / torch.FloatTensor([y.shape[0]])

def train(model, iterator, optimizer, criterion):
    epoch_loss = 0
    epoch_acc = 0

    model.train()

    for batch in iterator:
        optimizer.zero_grad()
        predictions = model(batch.text)
        loss = criterion(predictions, batch.label)
        acc = categorical_accuracy(predictions, batch.label)
        loss.backward()
        optimizer.step()

        epoch_loss += loss.item()
        epoch_acc += acc.item()

    return epoch_loss / len(iterator), epoch_acc / len(iterator)

def predict_class(model, sentence, min_len = 1):
    model.eval()
    tokenized = [tok.text for tok in nlp.tokenizer(sentence)]
    if len(tokenized) < min_len:
        tokenized += ['<pad>'] * (min_len - len(tokenized))
    indexed = [TEXT.vocab.stoi[t] for t in tokenized]
    tensor = torch.LongTensor(indexed)
    tensor = tensor.unsqueeze(1)
    preds = model(tensor)
    preds_np = preds.detach().numpy()[0]
    preds_np_softmax = np.exp(preds_np) / np.sum(np.exp(preds_np), axis=0)
    if np.max(preds_np_softmax) < 0.6 :
        return -1
    else :
        max_preds = preds.argmax(dim = 1)
        return max_preds.item()

TEXT = data.Field()
LABEL = data.LabelField()
SEED = 1234
MAX_VOCAB_SIZE = 25_000
BATCH_SIZE = 64
EMBEDDING_DIM = 50
N_FILTERS = 50
FILTER_SIZES = [1]
DROPOUT = 0.5
N_EPOCHS = 100

torch.manual_seed(SEED)

fields = {'question': ('text', TEXT), 'name': ('label', LABEL)}

train_data = data.TabularDataset(
                            path = os.path.join(os.path.dirname(__file__),'eva_nlp_training.json'),
                            format = 'json',
                            fields = fields)

TEXT.build_vocab(train_data,
                 max_size = MAX_VOCAB_SIZE,
                 vectors = "glove.6B.50d",
                 unk_init = torch.Tensor.normal_)

LABEL.build_vocab(train_data)

INPUT_DIM = len(TEXT.vocab)
OUTPUT_DIM = len(LABEL.vocab)
UNK_IDX = TEXT.vocab.stoi[TEXT.unk_token]
PAD_IDX = TEXT.vocab.stoi[TEXT.pad_token]

train_iterator = data.BucketIterator(
    train_data,
    batch_size = BATCH_SIZE)

model = CNN(INPUT_DIM, EMBEDDING_DIM, N_FILTERS, FILTER_SIZES, OUTPUT_DIM, DROPOUT)

option = sys.argv[1]

if option == '1':

    pretrained_embeddings = TEXT.vocab.vectors

    model.embedding.weight.data.copy_(pretrained_embeddings)

    model.embedding.weight.data[UNK_IDX] = torch.zeros(EMBEDDING_DIM)
    model.embedding.weight.data[PAD_IDX] = torch.zeros(EMBEDDING_DIM)

    optimizer = optim.Adam(model.parameters())

    criterion = nn.CrossEntropyLoss()

    best_train_loss = float('inf')

    for epoch in range(N_EPOCHS):

        train_loss, train_acc = train(model, train_iterator, optimizer, criterion)

        if train_loss < best_train_loss:
            best_train_loss = train_loss
            torch.save(model.state_dict(), os.path.join(os.path.dirname(__file__),'eva-nlp-model.pt'))

    model.load_state_dict(torch.load(os.path.join(os.path.dirname(__file__),'eva-nlp-model.pt')))

elif option == '2':

    model.load_state_dict(torch.load(os.path.join(os.path.dirname(__file__),'eva-nlp-model.pt')))

    nlp = spacy.load('en_core_web_sm')

    question = sys.argv[2]
 
    pred_class = predict_class(model, question)

    if (pred_class == -1) :
        print (-1)
    else :
        print(LABEL.vocab.itos[pred_class])
