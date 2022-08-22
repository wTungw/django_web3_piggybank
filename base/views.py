from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.

# contractAddress = ""

def piggybank(request):
    return render(request, 'base/piggybank.html')

# def piggybankSetting(request):
#     if request.method == 'POST':
#         print("contract address =",request.POST['contract_address'])
#         contractAddress = request.POST['contract_address']
#     return render(request, 'base/piggybankSetting.html')